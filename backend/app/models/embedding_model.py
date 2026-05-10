from sqlalchemy import Column, Integer, LargeBinary, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Embedding(Base):
    __tablename__ = "embeddings"

    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=True, index=True)
    person_name = Column(String(255), nullable=False)
    model_name = Column(String(64), nullable=False, default="facenet")
    vector = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
