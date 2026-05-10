"""
Real-time video stream processing service.
Handles frame capture, face detection, recognition, and event generation.
"""
import cv2
import threading
import logging
from datetime import datetime
from typing import Dict, Optional, List, Callable
from pathlib import Path
import uuid

from app.services.detection_service import detect_faces
from app.services.embedding_service import extract_embedding_from_frame
from app.services.recognition_service import recognize_embedding
from app.services.watermark_service import watermark_image, embed_lsb_payload, build_visible_watermark_text
from app.services.hash_service import sha256_file
from app.services.event_service import generate_event_code
from app.database import SessionLocal
from app.models.event_model import Event
from app.models.camera_model import Camera

logger = logging.getLogger(__name__)

# Global stream states
_stream_threads: Dict[int, threading.Thread] = {}
_stream_states: Dict[int, Dict] = {}
_stream_locks: Dict[int, threading.Lock] = {}
_event_callbacks: Dict[int, List[Callable]] = {}  # camera_id -> list of callbacks


class StreamProcessor:
    """Processes video frames from a camera source."""

    def __init__(self, camera_id: int, source: str, output_dir: Path = None):
        self.camera_id = camera_id
        self.source = source
        self.output_dir = output_dir or Path("data/captures")
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.is_running = False
        self.frame_count = 0
        self.face_count = 0
        self.last_frame = None
        self.last_detection_time = None

    def open_stream(self):
        """Open video stream from source."""
        try:
            # Try numeric index first (webcam)
            if self.source.isdigit():
                cap = cv2.VideoCapture(int(self.source))
            else:
                # URL or file path
                cap = cv2.VideoCapture(self.source)

            if not cap.isOpened():
                logger.error(f"Failed to open video source: {self.source}")
                return None

            # Set basic properties
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Minimize buffer
            cap.set(cv2.CAP_PROP_FPS, 15)  # Target 15 FPS

            return cap
        except Exception as e:
            logger.error(f"Error opening stream for camera {self.camera_id}: {e}")
            return None

    def process_frame(self, frame_bgr, db_session) -> Optional[Dict]:
        """
        Process a single frame:
        1. Detect faces
        2. Extract embeddings
        3. Recognize persons
        4. Create events if recognized
        5. Watermark and store
        """
        self.frame_count += 1
        self.last_frame = frame_bgr.copy()

        # Detect faces
        detections = detect_faces(frame_bgr)
        if not detections:
            return None

        self.face_count += len(detections)
        self.last_detection_time = datetime.utcnow()

        events_created = []

        # Get camera from DB
        camera = db_session.query(Camera).filter(Camera.id == self.camera_id).first()
        if not camera:
            logger.error(f"Camera {self.camera_id} not found")
            return None

        for detection in detections:
            try:
                box = detection["box"]
                x1, y1, x2, y2 = box

                # Crop face from frame
                face_crop = frame_bgr[max(0, y1):min(frame_bgr.shape[0], y2),
                                      max(0, x1):min(frame_bgr.shape[1], x2)]

                if face_crop.size == 0:
                    continue

                # Extract embedding
                embedding = extract_embedding_from_frame(face_crop)
                if embedding is None:
                    continue

                # Recognize
                recognition_result = recognize_embedding(embedding)
                person_name = recognition_result.get("person_name")
                confidence = recognition_result.get("confidence", 0.0)
                is_unknown = recognition_result.get("is_unknown", True)

                # Classify the result (AUTHORIZED, KNOWN_NON_AUTHORIZED, UNKNOWN)
                # based on whether person is found and their access status
                if is_unknown:
                    classification_status = "UNKNOWN"
                else:
                    # Look up access status in database
                    from app.models.person_model import Person
                    person = db_session.query(Person).filter(
                        Person.full_name == person_name
                    ).first()

                    if person and person.access_status == "NON_AUTHORIZED":
                        classification_status = "KNOWN_NON_AUTHORIZED"
                    else:
                        classification_status = "AUTHORIZED"

                # Save original image
                event_code = generate_event_code()
                timestamp = datetime.utcnow().isoformat()

                original_filename = f"{event_code}_original.jpg"
                original_path = self.output_dir / original_filename
                cv2.imwrite(str(original_path), face_crop)

                # Create visible watermark text
                visible_text = build_visible_watermark_text(
                    event_code=event_code,
                    camera_id=camera.camera_code,
                    status=classification_status
                )

                # Apply visible watermark
                watermarked_path = watermark_image(
                    path=str(original_path),
                    visible_text=visible_text,
                    output_path=str(self.output_dir / f"{event_code}_watermarked.jpg")
                )

                # Apply LSB watermark for authenticity
                invisible_watermark_payload = {
                    "event_code": event_code,
                    "camera_id": self.camera_id,
                    "person_name": person_name,
                    "status": classification_status,
                    "timestamp": timestamp,
                    "confidence": float(confidence)
                }

                try:
                    final_image_path = embed_lsb_payload(
                        path=watermarked_path,
                        payload=str(invisible_watermark_payload),
                        output_path=str(self.output_dir / f"{event_code}_final.jpg")
                    )
                except Exception as e:
                    logger.warning(f"LSB watermark failed: {e}, using visible only")
                    final_image_path = watermarked_path

                # Hash the final image
                image_hash = sha256_file(final_image_path)

                # Create event in database
                event = Event(
                    event_code=event_code,
                    camera_id=self.camera_id,
                    person_id=None,  # Will be linked if person record exists
                    person_name=person_name,
                    status=classification_status,
                    confidence=float(confidence),
                    original_image_path=str(original_path),
                    watermarked_image_path=final_image_path,
                    visible_watermark_text=visible_text,
                    invisible_watermark_payload=str(invisible_watermark_payload),
                    image_hash=image_hash,
                    verification_status="WATERMARKED"
                )

                db_session.add(event)
                db_session.commit()

                event_data = {
                    "event_code": event_code,
                    "camera_id": self.camera_id,
                    "person_name": person_name,
                    "status": classification_status,
                    "confidence": float(confidence),
                    "image_path": final_image_path,
                    "timestamp": timestamp
                }

                events_created.append(event_data)
                logger.info(f"Event created: {event_code} - {person_name} ({classification_status})")

                # Trigger callbacks
                if self.camera_id in _event_callbacks:
                    for callback in _event_callbacks[self.camera_id]:
                        try:
                            callback(event_data)
                        except Exception as e:
                            logger.error(f"Callback error: {e}")

            except Exception as e:
                logger.error(f"Error processing face detection: {e}")
                continue

        return {
            "frame_count": self.frame_count,
            "detections": len(detections),
            "events_created": len(events_created),
            "events": events_created
        }

    def run(self):
        """Main stream processing loop."""
        self.is_running = True
        cap = self.open_stream()

        if cap is None:
            self.is_running = False
            logger.error(f"Cannot start stream for camera {self.camera_id}")
            return

        logger.info(f"Starting stream processor for camera {self.camera_id}")
        frame_skip = 0

        try:
            while self.is_running:
                ret, frame = cap.read()

                if not ret:
                    logger.warning(f"Failed to read frame from camera {self.camera_id}")
                    break

                # Skip frames to maintain ~15 FPS
                frame_skip += 1
                if frame_skip < 2:  # Process every 2nd frame
                    continue
                frame_skip = 0

                # Resize frame for faster processing
                height, width = frame.shape[:2]
                if width > 640:
                    scale = 640 / width
                    frame = cv2.resize(frame, (640, int(height * scale)))

                # Process frame
                db_session = SessionLocal()
                try:
                    result = self.process_frame(frame, db_session)
                    if result and result.get("events_created", 0) > 0:
                        logger.info(f"Camera {self.camera_id}: {result}")
                finally:
                    db_session.close()

        except Exception as e:
            logger.error(f"Stream processor error for camera {self.camera_id}: {e}")
        finally:
            cap.release()
            self.is_running = False
            logger.info(f"Stream processor stopped for camera {self.camera_id}")

    def stop(self):
        """Stop the stream processor."""
        self.is_running = False

    def get_status(self) -> Dict:
        """Get processor status."""
        return {
            "camera_id": self.camera_id,
            "is_running": self.is_running,
            "frame_count": self.frame_count,
            "face_count": self.face_count,
            "last_detection_time": self.last_detection_time.isoformat() if self.last_detection_time else None,
            "has_frame": self.last_frame is not None
        }


def start_stream(camera_id: int, source: str) -> bool:
    """Start monitoring a camera stream."""
    if camera_id in _stream_threads:
        logger.warning(f"Stream already running for camera {camera_id}")
        return False

    _stream_locks[camera_id] = threading.Lock()

    processor = StreamProcessor(camera_id, source)
    _stream_states[camera_id] = {
        "processor": processor,
        "source": source,
        "started_at": datetime.utcnow()
    }

    thread = threading.Thread(
        target=processor.run,
        name=f"StreamProcessor-{camera_id}",
        daemon=False
    )
    thread.start()
    _stream_threads[camera_id] = thread

    logger.info(f"Stream started for camera {camera_id}")
    return True


def stop_stream(camera_id: int) -> bool:
    """Stop monitoring a camera stream."""
    if camera_id not in _stream_threads:
        return False

    with _stream_locks.get(camera_id, threading.Lock()):
        processor = _stream_states.get(camera_id, {}).get("processor")
        if processor:
            processor.stop()

        thread = _stream_threads.pop(camera_id, None)
        if thread:
            thread.join(timeout=5)

        _stream_states.pop(camera_id, None)
        logger.info(f"Stream stopped for camera {camera_id}")

    return True


def get_stream_status(camera_id: int) -> Optional[Dict]:
    """Get the status of a stream."""
    if camera_id not in _stream_states:
        return None

    processor = _stream_states[camera_id].get("processor")
    if processor:
        return processor.get_status()

    return None


def get_all_streams_status() -> Dict[int, Dict]:
    """Get status of all active streams."""
    result = {}
    for camera_id, state in _stream_states.items():
        processor = state.get("processor")
        if processor:
            result[camera_id] = processor.get_status()
    return result


def register_event_callback(camera_id: int, callback: Callable):
    """Register a callback for when events are created."""
    if camera_id not in _event_callbacks:
        _event_callbacks[camera_id] = []
    _event_callbacks[camera_id].append(callback)


def unregister_event_callback(camera_id: int, callback: Callable):
    """Unregister an event callback."""
    if camera_id in _event_callbacks:
        _event_callbacks[camera_id].remove(callback)
