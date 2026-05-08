from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    camera_code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)

    # 0 for laptop webcam, URL for phone/IP cam, or file path for video
    source = Column(String, nullable=False)

    location = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())