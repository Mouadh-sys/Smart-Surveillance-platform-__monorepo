from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_admin
from app.models.person_model import Person
from app.schemas.person_schema import PersonCreate, PersonRead
from app.models.admin_model import Admin

router = APIRouter(prefix="/persons", tags=["persons"])


@router.get("/", response_model=list[PersonRead])
def list_persons(db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    return db.query(Person).order_by(Person.id.asc()).all()


@router.post("/", response_model=PersonRead, status_code=201)
def create_person(payload: PersonCreate, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    person = Person(**payload.model_dump())
    db.add(person)
    db.commit()
    db.refresh(person)
    return person


@router.get("/{person_id}", response_model=PersonRead)
def get_person(person_id: int, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return person


@router.put("/{person_id}", response_model=PersonRead)
def update_person(person_id: int, payload: PersonCreate, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    for key, value in payload.model_dump().items():
        setattr(person, key, value)
    db.commit()
    db.refresh(person)
    return person


@router.delete("/{person_id}", status_code=204)
def delete_person(person_id: int, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    db.delete(person)
    db.commit()
