from datetime import datetime, timedelta, timezone
from typing import Optional
import logging
import sys

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

# Patch for bcrypt 5.0.0 compatibility with passlib
# bcrypt 5.0.0 moved __version__ from __about__.__version__ to __version__
try:
    import bcrypt as bcrypt_module
    if not hasattr(bcrypt_module, '__about__') and hasattr(bcrypt_module, '__version__'):
        # Create a mock __about__ module for compatibility
        class _About:
            __version__ = bcrypt_module.__version__
        bcrypt_module.__about__ = _About()
except Exception:
    pass  # If patching fails, passlib will handle the warning

logger = logging.getLogger(__name__)

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
    """Validate password length for bcrypt compatibility.

    Bcrypt has a hard limit of 72 bytes. We validate this before hashing.
    """
    if isinstance(password, str):
        password_bytes = len(password.encode("utf-8"))
    else:
        password_bytes = len(password)

    if password_bytes > BCRYPT_MAX_PASSWORD_BYTES:
        raise PasswordTooLongError(
            f"password cannot be longer than {BCRYPT_MAX_PASSWORD_BYTES} bytes when encoded in UTF-8 "
            f"(current: {password_bytes} bytes). "
            f"Please use a shorter password or truncate it: password[:{BCRYPT_MAX_PASSWORD_BYTES}]"
        )


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except ValueError as e:
        logger.warning(f"Password verification error: {e}")
        return False


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt.

    Args:
        password: The plain text password to hash

    Returns:
        The hashed password

    Raises:
        PasswordTooLongError: If password exceeds 72 bytes
        ValueError: If bcrypt operation fails
    """
    validate_password(password)
    try:
        hashed = pwd_context.hash(password)
        return hashed
    except ValueError as e:
        error_msg = str(e)
        # Only convert specific bcrypt length errors
        if "password" in error_msg.lower() and ("72" in error_msg or "length" in error_msg.lower()):
            raise PasswordTooLongError(f"bcrypt error: {error_msg}")
        # Re-raise other ValueErrors as-is
        raise


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
