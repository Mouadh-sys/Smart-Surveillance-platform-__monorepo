from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Person(Base):
    __tablename__ = "persons"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=True)

    # AUTHORIZED or NON_AUTHORIZED
    access_status = Column(String, nullable=False, default="AUTHORIZED")

    image_folder = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())