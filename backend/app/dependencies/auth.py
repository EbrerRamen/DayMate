from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException, Request
from jose import JWTError, jwt
from passlib.context import CryptContext
from bson import ObjectId

from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.db import engine
from app.models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_user_from_token(token: str):
    """
    Decode the JWT token and return the User odmantic model or raise JWTError on invalid token.
    """
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    sub = payload.get("sub")
    if not sub:
        raise JWTError("sub missing")
    try:
        oid = ObjectId(sub)
    except Exception as exc:
        raise JWTError("invalid user id in token") from exc
    user = await engine.find_one(User, User.id == oid)
    if not user:
        raise JWTError("user not found")
    return user


async def get_current_user_required(request: Request):
    """
    Dependency to require authentication. Expects header:
        Authorization: Bearer <token>
    """
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization token")
    token = auth.split(" ", 1)[1].strip()
    try:
        return await get_user_from_token(token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token") from None


async def get_current_user_optional(request: Request):
    """
    Try to return the user from Authorization header, or return None if not present/invalid.
    """
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        return None
    token = auth.split(" ", 1)[1].strip()
    try:
        return await get_user_from_token(token)
    except JWTError:
        return None

