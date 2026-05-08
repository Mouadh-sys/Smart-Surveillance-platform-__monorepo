from sqlalchemy import Column, DateTime, Integer, String, func

from app.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
