from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_admin
from app.models.event_model import Event
from app.schemas.event_schema import EventCreate, EventRead
from app.services.event_service import normalize_event_payload
from app.models.admin_model import Admin

router = APIRouter(tags=["events"])


@router.get("/", response_model=list[EventRead])
def list_events(
    status: str | None = Query(default=None),
    camera_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    query = db.query(Event)
    if status:
        query = query.filter(Event.status == status)
    if camera_id is not None:
        query = query.filter(Event.camera_id == camera_id)
    return query.order_by(Event.id.desc()).all()


@router.post("/", response_model=EventRead, status_code=201)
def create_event(payload: EventCreate, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    event = Event(**normalize_event_payload(payload.model_dump()))
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/{event_id}", response_model=EventRead)
def get_event(event_id: int, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.put("/{event_id}", response_model=EventRead)
def update_event(event_id: int, payload: EventCreate, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    for key, value in payload.model_dump().items():
        setattr(event, key, value)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=204)
def delete_event(event_id: int, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
