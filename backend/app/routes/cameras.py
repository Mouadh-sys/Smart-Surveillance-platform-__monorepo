from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_admin
from app.models.camera_model import Camera
from app.schemas.camera_schema import CameraCreate, CameraRead
from app.models.admin_model import Admin

router = APIRouter(tags=["cameras"])


@router.get("/", response_model=list[CameraRead])
def list_cameras(db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    return db.query(Camera).order_by(Camera.id.asc()).all()


@router.post("/", response_model=CameraRead, status_code=201)
def create_camera(payload: CameraCreate, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    camera = Camera(**payload.model_dump())
    db.add(camera)
    db.commit()
    db.refresh(camera)
    return camera


@router.get("/{camera_id}", response_model=CameraRead)
def get_camera(camera_id: int, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera


@router.put("/{camera_id}", response_model=CameraRead)
def update_camera(camera_id: int, payload: CameraCreate, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    for key, value in payload.model_dump().items():
        setattr(camera, key, value)
    db.commit()
    db.refresh(camera)
    return camera


@router.delete("/{camera_id}", status_code=204)
def delete_camera(camera_id: int, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    db.delete(camera)
    db.commit()
