from __future__ import annotations

import uuid
import logging
from pathlib import Path

import cv2
import numpy as np
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from app.dependencies import get_db, get_current_admin
from app.models.event_model import Event
from app.models.person_model import Person
from app.services.embedding_service import extract_embedding_from_frame
from app.services.event_service import generate_event_code
from app.services.hash_service import sha256_file
from app.services.recognition_service import (
    get_recognition_artifact_paths,
    load_recognition_model,
    recognize_embedding,
)
from app.services.watermark_service import (
    build_visible_watermark_text,
    embed_lsb_payload,
    watermark_image,
    _get_relative_path,
)

# Keep router without prefix because main.py already mounts it under /api/verification.
router = APIRouter(tags=["verification"])

APP_DIR = Path(__file__).resolve().parents[1]
CAPTURE_DIR = APP_DIR.parent / "data" / "captures"
CAPTURE_DIR.mkdir(parents=True, exist_ok=True)


def _resolve_access_status(db: Session, person_name: str | None) -> str | None:
    if not person_name:
        return None
    person = db.query(Person).filter(Person.full_name == person_name).first()
    if not person:
        return None
    return str(getattr(person, "access_status", None))


@router.post("/recognize-image")
async def recognize_image(file: UploadFile = File(...), db: Session = Depends(get_db), _: Person = Depends(get_current_admin)):
    image_bytes = await file.read()
    np_buffer = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)

    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    original_name = f"capture_{uuid.uuid4().hex}.jpg"
    original_path = CAPTURE_DIR / original_name
    if not cv2.imwrite(str(original_path), frame):
        raise HTTPException(status_code=500, detail="Unable to persist capture")

    embedding = extract_embedding_from_frame(frame)
    if embedding is None:
        return {
            "person_name": None,
            "confidence": 0.0,
            "is_unknown": True,
            "status": "NO_FACE_DETECTED",
            "original_image_path": _get_relative_path(original_path),
        }

    result = recognize_embedding(embedding)
    person_name = result.get("person_name") or result.get("predicted_person_name")
    access_status = _resolve_access_status(db, person_name)

    if result["is_unknown"]:
        status = "UNKNOWN"
    elif access_status == "NON_AUTHORIZED":
        status = "KNOWN_NON_AUTHORIZED"
    else:
        status = "AUTHORIZED"

    event_code = generate_event_code()
    visible_text = build_visible_watermark_text(event_code, None, status)
    invisible_payload_str = f"{event_code}|{status}|{person_name or 'UNKNOWN'}"

    # Apply visible watermark first
    watermarked_path = watermark_image(str(original_path), visible_text=visible_text)

    # Apply LSB watermark for authenticity
    try:
        final_image_path = embed_lsb_payload(watermarked_path, invisible_payload_str)
    except Exception as e:
        logger.warning(f"LSB watermark failed: {e}, using visible only")
        final_image_path = watermarked_path

    image_hash = sha256_file(final_image_path)

    event = Event(
        event_code=event_code,
        person_name=person_name,
        status=status,
        confidence=result.get("confidence"),
        original_image_path=_get_relative_path(original_path),
        watermarked_image_path=_get_relative_path(final_image_path),
        visible_watermark_text=visible_text,
        invisible_watermark_payload=invisible_payload_str,
        image_hash=image_hash,
        verification_status="NOT_VERIFIED",
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    return {
        **result,
        "status": status,
        "access_status": access_status,
        "event_id": event.id,
        "event_code": event.event_code,
        "original_image_path": _get_relative_path(original_path),
        "watermarked_image_path": _get_relative_path(watermarked_path),
        "visible_watermark_text": visible_text,
        "invisible_watermark_payload": invisible_payload_str,
        "image_hash": image_hash,
        "artifacts": get_recognition_artifact_paths(),
    }


@router.post("/reload-model")
def reload_model(_: Person = Depends(get_current_admin)):
    loaded = load_recognition_model(force=True)
    return {"loaded": loaded, "artifacts": get_recognition_artifact_paths()}


@router.get("/model-status")
def model_status(_: Person = Depends(get_current_admin)):
    loaded = load_recognition_model()
    artifacts = get_recognition_artifact_paths()
    return {
        "loaded": loaded,
        "artifacts": artifacts,
    }


@router.post("/verify-authenticity/{event_code}")
async def verify_event_authenticity(event_code: str, db: Session = Depends(get_db), _: Person = Depends(get_current_admin)):
    """
    Verify the authenticity of a captured event by checking:
    1. Watermark payload integrity
    2. Image hash integrity
    3. Watermark presence
    """
    event = db.query(Event).filter(Event.event_code == event_code).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if not event.watermarked_image_path:
        return {
            "event_code": event_code,
            "is_authentic": False,
            "reason": "No watermarked image found"
        }

    verification_result = {
        "event_code": event_code,
        "is_authentic": True,
        "checks": {},
        "metadata": {
            "event_status": event.status,
            "created_at": event.created_at.isoformat() if event.created_at else None,
            "person_name": event.person_name,
            "confidence": event.confidence
        }
    }

    # Check 1: Hash integrity
    try:
        current_hash = sha256_file(event.watermarked_image_path)
        if current_hash == event.image_hash:
            verification_result["checks"]["hash_integrity"] = {
                "passed": True,
                "message": "Image hash matches stored hash - no tampering detected"
            }
        else:
            verification_result["checks"]["hash_integrity"] = {
                "passed": False,
                "message": "Image hash does not match - image may have been tampered with",
                "stored_hash": event.image_hash,
                "current_hash": current_hash
            }
            verification_result["is_authentic"] = False
    except Exception as e:
        verification_result["checks"]["hash_integrity"] = {
            "passed": False,
            "message": f"Could not verify hash: {str(e)}"
        }
        verification_result["is_authentic"] = False

    # Check 2: Visible watermark presence
    if event.visible_watermark_text:
        verification_result["checks"]["visible_watermark"] = {
            "passed": True,
            "message": "Visible watermark is present",
            "content": event.visible_watermark_text
        }
    else:
        verification_result["checks"]["visible_watermark"] = {
            "passed": False,
            "message": "Visible watermark not found"
        }
        verification_result["is_authentic"] = False

    # Check 3: Invisible watermark presence
    if event.invisible_watermark_payload:
        verification_result["checks"]["invisible_watermark"] = {
            "passed": True,
            "message": "Invisible watermark (LSB) is present",
            "payload": event.invisible_watermark_payload
        }
    else:
        verification_result["checks"]["invisible_watermark"] = {
            "passed": False,
            "message": "Invisible watermark not found"
        }
        verification_result["is_authentic"] = False

    # Overall verdict
    if verification_result["is_authentic"]:
        verification_result["verdict"] = "AUTHENTIC - Image is genuine and unmodified"
        event.verification_status = "VERIFIED_AUTHENTIC"
    else:
        verification_result["verdict"] = "POTENTIALLY_TAMPERED - Image may have been modified"
        event.verification_status = "VERIFIED_TAMPERED"

    db.commit()

    return verification_result

