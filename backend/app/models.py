# backend/app/models.py
from odmantic import Model, Field
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from bson import ObjectId

# MongoDB User model
class User(Model):
    email: EmailStr
    hashed_password: str
    full_name: Optional[str] = None


# ---- Pydantic Schemas (Request bodies) ----

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str]

    class Config:
        orm_mode = True

class DailyPlan(Model):
    user_id: ObjectId
    location_name: str
    plan: dict       # the JSON returned by LLM
    created_at: datetime = Field(default_factory=datetime.utcnow)
