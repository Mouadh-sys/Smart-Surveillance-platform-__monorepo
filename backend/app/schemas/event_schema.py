from datetime import datetime
from pydantic import BaseModel


class EventBase(BaseModel):
    event_code: str
    camera_id: int | None = None
    person_id: int | None = None
    person_name: str | None = None
    status: str
    confidence: float | None = None
    original_image_path: str | None = None
    watermarked_image_path: str | None = None
    visible_watermark_text: str | None = None
    invisible_watermark_payload: str | None = None
    image_hash: str | None = None
    verification_status: str = "NOT_VERIFIED"


class EventCreate(EventBase):
    pass


class EventRead(EventBase):
    id: int
    created_at: datetime | None = None

    class Config:
        from_attributes = True
