"""
Monitoring routes - Real-time video stream control and status.
"""
from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import StreamingResponse, HTMLResponse
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_admin
from app.models.admin_model import Admin
from app.services.monitoring_service import (
    get_status,
    start_monitoring_camera,
    stop_monitoring_camera,
    start_all_cameras,
    stop_all_cameras,
    get_camera_status,
    get_all_cameras_status
)
from app.services.stream_service import get_latest_frame
from app.models.camera_model import Camera
from app.services.websocket_service import manager
from app.services.auth_service import decode_token
import logging
import cv2
import asyncio

logger = logging.getLogger(__name__)

router = APIRouter(tags=["monitoring"])


@router.get("/status")
async def get_monitoring_status(_: Admin = Depends(get_current_admin)):
    """Get overall monitoring status and active streams."""
    return get_status()


@router.get("/cameras")
async def get_cameras_status(db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    """Get status of all cameras."""
    cameras = db.query(Camera).all()
    camera_list = []

    for camera in cameras:
        stream_status = get_camera_status(camera.id)
        camera_list.append({
            "id": camera.id,
            "code": camera.camera_code,
            "name": camera.name,
            "source": camera.source,
            "location": camera.location,
            "is_active": camera.is_active,
            "stream_status": stream_status
        })

    return {
        "success": True,
        "total_cameras": len(camera_list),
        "cameras": camera_list
    }


@router.get("/cameras/{camera_id}/status")
async def get_camera_stream_status(camera_id: int, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    """Get status of a specific camera stream."""
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    status = get_camera_status(camera_id)

    return {
        "success": True,
        "camera": {
            "id": camera.id,
            "code": camera.camera_code,
            "name": camera.name
        },
        "stream_status": status
    }


@router.post("/cameras/{camera_id}/start")
async def start_camera_monitoring(
    camera_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin)
):
    """Start monitoring a specific camera."""
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    result = start_monitoring_camera(camera_id)

    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))

    return result


@router.post("/cameras/{camera_id}/stop")
async def stop_camera_monitoring(camera_id: int, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    """Stop monitoring a specific camera."""
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    result = stop_monitoring_camera(camera_id)

    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))

    return result


@router.post("/start-all")
async def start_all_monitoring(_: Admin = Depends(get_current_admin)):
    """Start monitoring all active cameras."""
    result = start_all_cameras()
    return result


@router.post("/stop-all")
async def stop_all_monitoring(_: Admin = Depends(get_current_admin)):
    """Stop monitoring all cameras."""
    result = stop_all_cameras()
    return result


@router.get("/stream/{camera_id}")
async def stream_camera(camera_id: int, token: str = Query(None), db: Session = Depends(get_db)):
    """Stream MJPEG video feed for a camera.

    Reads frames from the already-running StreamProcessor instead of opening
    a second VideoCapture (which would fail on Windows for webcams).
    Accepts token as query parameter to support img tags which can't send headers.
    """
    # Authenticate with token if provided, otherwise require auth header
    if token:
        try:
            token_data = decode_token(token)
            if not token_data.get("sub"):
                raise HTTPException(status_code=401, detail="Invalid token")
        except Exception as e:
            logger.error(f"Token validation failed: {e}")
            raise HTTPException(status_code=401, detail="Invalid token")
    else:
        raise HTTPException(status_code=401, detail="No token provided")

    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    if not camera.is_active:
        raise HTTPException(status_code=400, detail="Camera is not active")

    # Check if stream is already running
    stream_status = get_camera_status(camera_id)
    if not stream_status or not stream_status.get("is_running"):
        raise HTTPException(status_code=400, detail="Camera stream not running - start monitoring first")

    async def video_generator():
        """Generate MJPEG frames from the running StreamProcessor."""
        try:
            while True:
                frame_bytes = get_latest_frame(camera_id)
                if frame_bytes is None:
                    # Stream may have stopped or no frame yet
                    await asyncio.sleep(0.1)
                    # Check if stream is still running
                    status = get_camera_status(camera_id)
                    if not status or not status.get("is_running"):
                        logger.info(f"Stream stopped for camera {camera_id}, ending MJPEG")
                        return
                    continue

                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n'
                       b'Content-length: ' + str(len(frame_bytes)).encode() + b'\r\n\r\n'
                       + frame_bytes + b'\r\n')

                await asyncio.sleep(0.033)  # ~30 FPS

        except Exception as e:
            logger.error(f"Stream error for camera {camera_id}: {e}")

    return StreamingResponse(video_generator(), media_type="multipart/x-mixed-replace; boundary=frame")



@router.websocket("/ws")
async def websocket_monitoring(websocket: WebSocket, token: str = Query(None)):
    """WebSocket endpoint for monitoring events.

    Added defensive logging around the accept/receive loop so handshake failures
    are visible in the backend logs (helps diagnose "closed before established").

    Accepts token as query parameter for authentication.
    """
    # Authenticate with token if provided
    if token:
        try:
            token_data = decode_token(token)
            if not token_data.get("sub"):
                logger.error("Invalid token - no 'sub' claim")
                await websocket.close(code=1008, reason="Invalid token")
                return
        except Exception as e:
            logger.error(f"WebSocket token validation failed: {e}")
            await websocket.close(code=1008, reason="Invalid token")
            return
    else:
        logger.error("WebSocket connection attempted without token")
        await websocket.close(code=1008, reason="Token required")
        return
    try:
        await manager.connect(websocket)
    except Exception as exc:
        # If accept fails (bad handshake / proxy / early disconnect), log and close.
        logger.exception("WebSocket accept failed: %s", exc)
        try:
            await websocket.close(code=1011)
        except Exception:
            pass
        return

    try:
        await manager.send_personal_message({"type": "connected", "message": "Monitoring WebSocket connected"}, websocket)
        while True:
            try:
                message = await websocket.receive_text()
            except WebSocketDisconnect:
                logger.info("WebSocket client disconnected")
                break
            except Exception as exc:
                # Unexpected errors while receiving - log and break to disconnect cleanly
                logger.exception("Error receiving from WebSocket: %s", exc)
                break

            if message == "ping":
                try:
                    await manager.send_personal_message({"type": "pong"}, websocket)
                except Exception:
                    logger.exception("Failed to send pong to websocket")
            else:
                try:
                    await manager.send_personal_message({"type": "echo", "message": message}, websocket)
                except Exception:
                    logger.exception("Failed to send echo to websocket")
    finally:
        manager.disconnect(websocket)


