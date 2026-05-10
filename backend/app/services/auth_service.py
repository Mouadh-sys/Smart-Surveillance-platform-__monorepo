from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Fallbacks for local development if env vars are not yet provided.
SECRET_KEY = getattr(settings, "secret_key", "change-me-in-production")
ALGORITHM = getattr(settings, "jwt_algorithm", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = getattr(settings, "access_token_expire_minutes", 60)
REFRESH_TOKEN_EXPIRE_DAYS = getattr(settings, "refresh_token_expire_days", 7)

# bcrypt only supports passwords up to 72 bytes.
BCRYPT_MAX_PASSWORD_BYTES = 72

# Simple in-memory token blacklist for logout
_token_blacklist: set[str] = set()


class PasswordTooLongError(ValueError):
    pass


def validate_password(password: str) -> None:
    if len(password.encode("utf-8")) > BCRYPT_MAX_PASSWORD_BYTES:
        raise PasswordTooLongError(
            f"password cannot be longer than {BCRYPT_MAX_PASSWORD_BYTES} bytes when encoded in UTF-8"
        )


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    validate_password(password)
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def extract_username_from_token(token: str) -> str | None:
    try:
        payload = decode_token(token)
        return payload.get("sub")
    except JWTError:
        return None


def revoke_token(token: str) -> None:
    _token_blacklist.add(token)


def is_token_revoked(token: str) -> bool:
    return token in _token_blacklist
