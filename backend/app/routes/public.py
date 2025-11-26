from fastapi import APIRouter, HTTPException, Query

from app.services.weather import fetch_weather, reverse_geocode
from app.services.news import fetch_news

router = APIRouter(tags=["public"])


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.get("/api/weather")
async def weather(lat: float = Query(...), lon: float = Query(...)):
    try:
        return await fetch_weather(lat, lon)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/api/news")
async def news(lat: float = Query(...), lon: float = Query(...)):
    try:
        location_name = await reverse_geocode(lat, lon)
        return await fetch_news(location_name)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

