from sqlalchemy import Column, Integer, LargeBinary, String

from app.database import Base


class Embedding(Base):
    __tablename__ = "embeddings"

    id = Column(Integer, primary_key=True, index=True)
    person_name = Column(String(255), nullable=False)
    vector = Column(LargeBinary, nullable=False)
