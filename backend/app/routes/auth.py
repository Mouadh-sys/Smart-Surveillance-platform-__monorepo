from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError

from app.dependencies import get_db, get_current_admin
from app.models.admin_model import Admin
from app.schemas.token_schema import Token, AdminRead, AdminCreate, TokenRefreshRequest
from app.services.auth_service import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    decode_token,
    is_token_revoked,
)

router = APIRouter(tags=["auth"])


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == form_data.username).first()
    try:
        is_valid_password = verify_password(form_data.password, admin.password_hash)
    except Exception:
        # This handles cases where the hash is invalid, preventing a 500 error.
        is_valid_password = False

    if not admin or not is_valid_password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")

    access_token = create_access_token({"sub": admin.username})
    refresh_token = create_refresh_token({"sub": admin.username})
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=Token)
def refresh_token(payload: TokenRefreshRequest, db: Session = Depends(get_db)):
    try:
        token_data = decode_token(payload.refresh_token)
        if token_data.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        if is_token_revoked(payload.refresh_token):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked")

        username = token_data.get("sub")
        if not username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        admin = db.query(Admin).filter(Admin.username == username).first()
        if not admin:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin not found")

        new_access_token = create_access_token({"sub": admin.username})
        return Token(access_token=new_access_token, refresh_token=payload.refresh_token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@router.post("/logout")
def logout(current_admin: Admin = Depends(get_current_admin)):
    # In a real scenario, we'd revoke the current token from the request context
    # For now, this is a placeholder that confirms logout intent
    return {"message": "Logout successful"}


@router.get("/me", response_model=AdminRead)
def read_current_admin(current_admin: Admin = Depends(get_current_admin)):
    return current_admin


@router.post("/bootstrap-admin", response_model=AdminRead, status_code=201)
def bootstrap_admin(payload: AdminCreate, db: Session = Depends(get_db)):
    existing_admin = db.query(Admin).first()
    if existing_admin:
        raise HTTPException(status_code=400, detail="An admin account already exists")

    admin = Admin(username=payload.username, password_hash=get_password_hash(payload.password))
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin
