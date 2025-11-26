from pydantic import BaseModel


class PlanRequest(BaseModel):
    lat: float
    lon: float
    location_name: str = "your area"
    preferences: dict = {}

