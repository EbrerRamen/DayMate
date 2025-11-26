import httpx
from fastapi import HTTPException

from app.config import OPENWEATHER_KEY


async def fetch_weather(lat: float, lon: float):
    if not OPENWEATHER_KEY:
        raise RuntimeError("OPENWEATHER_KEY not set")
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {"lat": lat, "lon": lon, "units": "metric", "appid": OPENWEATHER_KEY}
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            r = await client.get(url, params=params)
            r.raise_for_status()
            return r.json()
        except httpx.HTTPStatusError as exc:
            print("Weather HTTP error:", exc.response.status_code, exc.response.text)
            raise HTTPException(status_code=502, detail="Weather API error") from exc
        except Exception as exc:
            print("Weather other error:", exc)
            raise HTTPException(status_code=502, detail="Weather API error") from exc


async def reverse_geocode(lat: float, lon: float):
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {"lat": lat, "lon": lon, "format": "json", "accept-language": "en"}
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url, params=params)
        r.raise_for_status()
        data = r.json()
        return (
            data.get("address", {}).get("city")
            or data.get("address", {}).get("town")
            or data.get("address", {}).get("state")
            or "your area"
        )

