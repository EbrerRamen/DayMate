from datetime import datetime
from pydantic import BaseModel, Field


class LocationBase(BaseModel):
    label: str = Field(..., max_length=80)
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)


class LocationCreate(LocationBase):
    pass


class LocationResponse(LocationBase):
    id: str
    created_at: datetime

    class Config:
        orm_mode = True

