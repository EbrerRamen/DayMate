# backend/app/main.py
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import httpx
import json
from dotenv import load_dotenv

load_dotenv()  # only used for local dev when running with .env

app = FastAPI(title="DayMate API")

# CORS - allow your frontend origin in production
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origins[0]],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables (must be set on deployment)
OPENWEATHER_KEY = os.getenv("OPENWEATHER_KEY")
# print("OpenWeather key:", OPENWEATHER_KEY)
NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")
LLM_API_KEY = os.getenv("LLM_API_KEY")  # OpenAI or other provider
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")  # simple switch

class PlanRequest(BaseModel):
    lat: float
    lon: float
    location_name: str = "your area"
    preferences: dict = {}

async def fetch_weather(lat: float, lon: float):
    if not OPENWEATHER_KEY:
        raise RuntimeError("OPENWEATHER_KEY not set")
    url = f"https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "units": "metric",
        "appid": OPENWEATHER_KEY
    }
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            r = await client.get(url, params=params)
            r.raise_for_status()
            return r.json()
        except httpx.HTTPStatusError as e:
            print("HTTP error:", e.response.status_code, e.response.text)
            raise HTTPException(status_code=502, detail="Weather API error")
        except Exception as e:
            print("Other error:", e)
            raise HTTPException(status_code=502, detail="Weather API error")

async def fetch_news(location: str, page_size: int = 5):
    if not NEWSAPI_KEY:
        raise RuntimeError("NEWSAPI_KEY not set")
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": location,
        "pageSize": page_size,
        "apiKey": NEWSAPI_KEY,
        "language": "en",
        "sortBy": "publishedAt"
    }
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url, params=params)
    r.raise_for_status()
    return r.json()

def build_prompt(weather_json, news_json, preferences):
    # concise structured prompt
    current = weather_json.get("current", {})
    main = current.get("weather", [{}])[0].get("main", "Unknown")
    temp = current.get("temp", "Unknown")
    pop = None
    try:
        pop = weather_json.get("hourly", [{}])[0].get("pop", 0)
    except Exception:
        pop = 0
    weather_summary = f"{main}, {temp}°C, precipitation_prob={pop}"
    headlines = []
    for a in news_json.get("articles", [])[:5]:
        t = a.get("title")
        if t:
            headlines.append(t)
    news_block = "\n".join([f"- {h}" for h in headlines]) or "No major headlines."
    prompt = f"""
You are DayMate, an assistant that creates a daily plan. Use the weather and local news.
Weather summary: {weather_summary}
Top news:
{news_block}
User preferences: {preferences}

Return a JSON object EXACTLY with keys:
{
  "priority_actions": [strings],
  "suggestions": [strings],
  "rationale": "short reason",
  "quick_tips": [strings],
  "summary": "one-sentence summary"
}
Also include human-friendly text under 'summary'.
"""
    return prompt

async def call_llm(prompt: str):
    if LLM_PROVIDER == "openai":
        # OpenAI Chat Completions (REST)
        if not LLM_API_KEY:
            raise RuntimeError("LLM_API_KEY not set")
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {LLM_API_KEY}"}
        payload = {
            "model": "gpt-4o-mini",  # change to available model for your account
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 500,
            "temperature": 0.4
        }
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(url, json=payload, headers=headers)
        r.raise_for_status()
        data = r.json()
        return data["choices"][0]["message"]["content"]
    else:
        # placeholder - implement other providers if needed
        raise RuntimeError("Unsupported LLM_PROVIDER")

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api/weather")
async def weather(lat: float = Query(...), lon: float = Query(...)):
    try:
        return await fetch_weather(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@app.get("/api/news")
async def news(location: str = Query("Dhaka")):
    try:
        return await fetch_news(location)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@app.post("/api/plan")
async def plan(req: PlanRequest):
    try:
        weather = await fetch_weather(req.lat, req.lon)
        news = await fetch_news(req.location_name)
        prompt = build_prompt(weather, news, req.preferences)
        llm_resp = await call_llm(prompt)
        try:
            parsed = json.loads(llm_resp)
            return {"plan": parsed}
        except Exception:
            # return raw text if JSON parsing fails
            return {"raw": llm_resp}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
