from datetime import datetime

from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class TokenData(BaseModel):
    username: str | None = None


class AdminRead(BaseModel):
    id: int
    username: str
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class AdminCreate(BaseModel):
    username: str
    password: str
