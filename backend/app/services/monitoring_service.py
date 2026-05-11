"""
Monitoring service - orchestrates real-time video stream monitoring.
"""
import logging
from typing import Dict, Optional, List
from datetime import datetime

from app.database import SessionLocal
from app.models.camera_model import Camera
from app.services.stream_service import (
    start_stream,
    stop_stream,
    get_stream_status,
    get_all_streams_status,
    register_event_callback,
    unregister_event_callback
)
from app.services.websocket_service import handle_stream_event

logger = logging.getLogger(__name__)

# Callbacks for websocket/event broadcasting
_monitoring_callbacks: List = []


def _broadcast_event(event_data: dict) -> None:
    for callback in list(_monitoring_callbacks):
        try:
            callback(event_data)
        except Exception as exc:
            logger.error("Monitoring callback failed: %s", exc)

    handle_stream_event(event_data)


def get_status() -> Dict:
    """Get overall monitoring status."""
    streams = get_all_streams_status()
    return {
        "status": "ok",
        "active_streams": len(streams),
        "streams": streams,
        "timestamp": datetime.utcnow().isoformat()
    }


def start_monitoring_camera(camera_id: int) -> Dict:
    """Start monitoring a specific camera."""
    db_session = SessionLocal()
    try:
        camera = db_session.query(Camera).filter(Camera.id == camera_id).first()
        if not camera:
            return {
                "success": False,
                "error": f"Camera {camera_id} not found"
            }

        if not camera.is_active:
            return {
                "success": False,
                "error": f"Camera {camera_id} is not active"
            }

        register_event_callback(camera_id, _broadcast_event)

        success = start_stream(camera_id, camera.source)

        if success:
            logger.info(f"Started monitoring camera {camera_id}: {camera.name}")
            return {
                "success": True,
                "camera_id": camera_id,
                "camera_name": camera.name,
                "message": f"Monitoring started for {camera.name}"
            }
        else:
            unregister_event_callback(camera_id, _broadcast_event)
            error_msg = f"Failed to start stream for camera {camera_id} with source '{camera.source}'. Check if the source is valid and accessible."
            logger.error(error_msg)
            return {
                "success": False,
                "error": error_msg
            }
    finally:
        db_session.close()


def stop_monitoring_camera(camera_id: int) -> Dict:
    """Stop monitoring a specific camera."""
    unregister_event_callback(camera_id, _broadcast_event)
    success = stop_stream(camera_id)

    if success:
        logger.info(f"Stopped monitoring camera {camera_id}")
        return {
            "success": True,
            "camera_id": camera_id,
            "message": f"Monitoring stopped for camera {camera_id}"
        }
    else:
        return {
            "success": False,
            "error": f"No active stream for camera {camera_id}"
        }


def start_all_cameras() -> Dict:
    """Start monitoring all active cameras."""
    db_session = SessionLocal()
    results = []

    try:
        cameras = db_session.query(Camera).filter(Camera.is_active == True).all()

        for camera in cameras:
            result = start_stream(camera.id, camera.source)
            if result:
                register_event_callback(camera.id, _broadcast_event)
            results.append({
                "camera_id": camera.id,
                "camera_name": camera.name,
                "success": result
            })
            logger.info(f"Started monitoring camera {camera.id}: {camera.name}")

        return {
            "success": True,
            "cameras_started": sum(1 for r in results if r["success"]),
            "total_cameras": len(results),
            "results": results
        }
    finally:
        db_session.close()


def stop_all_cameras() -> Dict:
    """Stop monitoring all cameras."""
    from app.services.stream_service import _stream_threads

    camera_ids = list(_stream_threads.keys())
    stopped = 0

    for camera_id in camera_ids:
        if stop_monitoring_camera(camera_id).get("success"):
            stopped += 1

    logger.info(f"Stopped monitoring {stopped} cameras")
    return {
        "success": True,
        "cameras_stopped": stopped,
        "message": f"Stopped monitoring {stopped} cameras"
    }


def get_camera_status(camera_id: int) -> Optional[Dict]:
    """Get status of a specific camera stream."""
    return get_stream_status(camera_id)


def get_all_cameras_status() -> Dict:
    """Get status of all camera streams."""
    return get_all_streams_status()


def register_monitoring_callback(callback) -> None:
    """Register a callback for monitoring events (e.g., for websockets)."""
    if callback not in _monitoring_callbacks:
        _monitoring_callbacks.append(callback)
    logger.info("Monitoring callback registered")


def unregister_monitoring_callback(callback) -> None:
    """Unregister a monitoring callback."""
    if callback in _monitoring_callbacks:
        _monitoring_callbacks.remove(callback)
        logger.info("Monitoring callback unregistered")
