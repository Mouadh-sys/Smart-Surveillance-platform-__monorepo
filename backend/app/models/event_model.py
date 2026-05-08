from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event_code = Column(String, unique=True, nullable=False)

    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=True)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=True)

    person_name = Column(String, nullable=True)

    # AUTHORIZED, KNOWN_NON_AUTHORIZED, UNKNOWN
    status = Column(String, nullable=False)

    confidence = Column(Float, nullable=True)

    original_image_path = Column(String, nullable=True)
    watermarked_image_path = Column(String, nullable=True)

    visible_watermark_text = Column(Text, nullable=True)
    invisible_watermark_payload = Column(Text, nullable=True)

    image_hash = Column(String, nullable=True)
    verification_status = Column(String, default="NOT_VERIFIED")

    created_at = Column(DateTime(timezone=True), server_default=func.now())