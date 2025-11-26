from fastapi import APIRouter, Depends, HTTPException

from app.db import engine
from app.models import User, UserCreate, UserLogin, UserResponse
from app.dependencies.auth import hash_password, verify_password, create_access_token, get_current_user_required

router = APIRouter(tags=["auth"])


@router.post("/auth/register")
async def register(user: UserCreate):
    existing = await engine.find_one(User, User.email == user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = hash_password(user.password)
    user_doc = User(email=user.email, hashed_password=hashed_password, full_name=user.full_name)
    await engine.save(user_doc)
    return {"msg": "User created successfully"}


@router.post("/auth/login")
async def login(user: UserLogin):
    db_user = await engine.find_one(User, User.email == user.email)
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(db_user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/users/me", response_model=UserResponse)
async def users_me(current_user: User = Depends(get_current_user_required)):
    return UserResponse(id=str(current_user.id), email=current_user.email, full_name=current_user.full_name)

