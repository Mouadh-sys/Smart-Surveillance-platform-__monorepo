"""
Monitoring routes - Real-time video stream control and status.
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, WebSocket, WebSocketDisconnect
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
from app.models.camera_model import Camera
from app.services.websocket_service import manager

router = APIRouter(prefix="/monitoring", tags=["monitoring"])


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
    background_tasks: BackgroundTasks,
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


@router.websocket("/ws")
async def websocket_monitoring(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await manager.send_personal_message({"type": "connected", "message": "Monitoring WebSocket connected"}, websocket)
        while True:
            try:
                message = await websocket.receive_text()
            except WebSocketDisconnect:
                break
            if message == "ping":
                await manager.send_personal_message({"type": "pong"}, websocket)
            else:
                await manager.send_personal_message({"type": "echo", "message": message}, websocket)
    finally:
        manager.disconnect(websocket)
