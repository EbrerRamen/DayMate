# backend/app/main.py
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import httpx
import json
from dotenv import load_dotenv
from openai import OpenAI

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
    # Weather summary
    main = weather_json.get("weather", [{}])[0].get("main", "Unknown")
    temp = weather_json.get("main", {}).get("temp", "Unknown")
    pop = weather_json.get("rain", {}).get("1h", 0)  # precipitation probability fallback
    weather_summary = f"{main}, {temp}°C, precipitation_prob={pop}"

    # Top 5 news headlines
    headlines = []
    for article in news_json.get("articles", [])[:5]:
        title = article.get("title")
        if title:
            headlines.append(title)
    news_block = "\n".join([f"- {h}" for h in headlines]) or "No major headlines."

    # Build prompt
    prompt = f"""
You are DayMate, an AI assistant that creates a daily plan for the user.
Use the following weather and news information to produce a **valid JSON object only**. Do not add any extra text outside the JSON.

Weather summary: {weather_summary}
Top news:
{news_block}
User preferences: {preferences}

Return JSON with exactly the following keys:
{{
  "priority_actions": ["example action 1", "example action 2"],
  "suggestions": ["example suggestion 1", "example suggestion 2"],
  "rationale": "short reason for the plan",
  "quick_tips": ["example tip 1", "example tip 2"],
  "summary": "one-sentence summary"
}}

Make sure the JSON is valid and parsable. Do not include any commentary outside the JSON.
"""
    return prompt

async def call_llm(prompt: str):
    if LLM_PROVIDER == "huggingface":
        if not LLM_API_KEY:
            raise RuntimeError("LLM_API_KEY not set")
        
        client = OpenAI(
            base_url="https://router.huggingface.co/v1",
            api_key=LLM_API_KEY,
        )

        completion = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V3.2-Exp:novita",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=500
    )

        data = completion.choices[0].message.content
        print("LLM output", data)

        try:
            parsed = json.loads(data)
            return parsed
        except json.JSONDecodeError:
            # fallback: return raw string if JSON parsing fails
            return {"raw": data}

    else:
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
        # 1️⃣ Fetch data
        weather = await fetch_weather(req.lat, req.lon)
        news = await fetch_news(req.location_name)

        # 2️⃣ Build structured prompt
        prompt = build_prompt(weather, news, req.preferences)

        # 3️⃣ Call Hugging Face LLM
        llm_resp = await call_llm(prompt)
        return {"plan": llm_resp}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
