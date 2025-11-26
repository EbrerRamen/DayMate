from typing import List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.db import engine
from app.models import SavedLocation, User
from app.schemas.location import LocationCreate, LocationResponse
from app.dependencies.auth import get_current_user_required

router = APIRouter(tags=["locations"])


def serialize_location(location: SavedLocation) -> LocationResponse:
    return LocationResponse(
        id=str(location.id),
        label=location.label,
        lat=location.lat,
        lon=location.lon,
        created_at=location.created_at,
    )


@router.get("/api/locations", response_model=List[LocationResponse])
async def list_locations(current_user: User = Depends(get_current_user_required)):
    locations = await engine.find(SavedLocation, SavedLocation.user_id == current_user.id)
    return [serialize_location(loc) for loc in locations]


@router.post("/api/locations", response_model=LocationResponse, status_code=201)
async def create_location(payload: LocationCreate, current_user: User = Depends(get_current_user_required)):
    label = payload.label.strip()
    if not label:
        raise HTTPException(status_code=400, detail="Label cannot be empty")

    location = SavedLocation(user_id=current_user.id, label=label, lat=payload.lat, lon=payload.lon)
    await engine.save(location)
    return serialize_location(location)


@router.delete("/api/locations/{location_id}", status_code=204)
async def delete_location(location_id: str, current_user: User = Depends(get_current_user_required)):
    try:
        oid = ObjectId(location_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid location id") from exc

    location = await engine.find_one(SavedLocation, SavedLocation.id == oid)
    if not location or location.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Location not found")
    await engine.delete(location)

