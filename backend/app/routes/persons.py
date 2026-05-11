import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_admin
from app.models.person_model import Person
from app.schemas.person_schema import PersonCreate, PersonRead
from app.models.admin_model import Admin

router = APIRouter(tags=["persons"])


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


@router.post("/{person_id}/images")
async def upload_person_images(
    person_id: int,
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    """Upload face images for a person to be used in recognition training."""
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    # Determine the target folder
    base_dir = Path(__file__).resolve().parents[1].parent / "data" / "persons" / str(person_id)
    base_dir.mkdir(parents=True, exist_ok=True)

    saved_files = []
    for upload_file in files:
        # Sanitise the filename
        safe_name = f"{uuid.uuid4().hex}_{upload_file.filename}"
        file_path = base_dir / safe_name
        contents = await upload_file.read()
        file_path.write_bytes(contents)
        saved_files.append(str(file_path))

    # Update person's image_folder if not already set
    if not person.image_folder:
        person.image_folder = str(base_dir)
        db.commit()
        db.refresh(person)

    return {
        "success": True,
        "person_id": person_id,
        "files_saved": len(saved_files),
        "image_folder": str(base_dir),
    }

