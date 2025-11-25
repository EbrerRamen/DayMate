# backend/app/main.py
from fastapi import FastAPI, Query, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
import os
import httpx
import json
from dotenv import load_dotenv
from openai import OpenAI
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List
from bson import ObjectId

# ODMantic engine & models
from app.db import engine
from app.models import User, UserCreate, UserLogin, UserResponse, DailyPlan

load_dotenv()

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

# Env vars
OPENWEATHER_KEY = os.getenv("OPENWEATHER_KEY")
NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")
LLM_API_KEY = os.getenv("LLM_API_KEY")  # OpenAI or other provider
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY not set!")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# --------------------
# Auth helpers
# --------------------
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


async def get_current_user(token: str = Depends(lambda request=None: None)):
    """
    Not used directly as Depends because we implement our own dependency below.
    Kept for reference.
    """
    raise NotImplementedError


async def get_user_from_token(token: str):
    """
    Decode the JWT token and return the User odmantic model or None.
    Raises JWTError on invalid token.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if not sub:
            raise JWTError("sub missing")
        # sub is the user id (stringified ObjectId)
        try:
            oid = ObjectId(sub)
        except Exception:
            raise JWTError("invalid user id in token")
        user = await engine.find_one(User, User.id == oid)
        if not user:
            raise JWTError("user not found")
        return user
    except JWTError as e:
        raise


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
        user = await get_user_from_token(token)
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user_optional(request: Request):
    """
    Try to return the user from Authorization header, or return None if not present/invalid.
    Used by /api/plan so anyone can generate plans without login, but logged-in users have their plans saved.
    """
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        return None
    token = auth.split(" ", 1)[1].strip()
    try:
        user = await get_user_from_token(token)
        return user
    except JWTError:
        return None


# --------------------
# Request schemas
# --------------------
class PlanRequest(BaseModel):
    lat: float
    lon: float
    location_name: str = "your area"
    preferences: dict = {}


# --------------------
# Weather / News / LLM logic
# --------------------
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
        except httpx.HTTPStatusError as e:
            print("Weather HTTP error:", e.response.status_code, e.response.text)
            raise HTTPException(status_code=502, detail="Weather API error")
        except Exception as e:
            print("Weather other error:", e)
            raise HTTPException(status_code=502, detail="Weather API error")


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


async def fetch_news(location: str, page_size: int = 5):
    if not NEWSAPI_KEY:
        raise RuntimeError("NEWSAPI_KEY not set")
    url = "https://newsapi.org/v2/everything"
    # url = "https://newsapi.org/v2/top-headliness"
    params = {"q": location, "pageSize": page_size, "apiKey": NEWSAPI_KEY, "language": "en", "sortBy": "publishedAt"}
    # params = {"q": location, "pageSize": page_size, "apiKey": NEWSAPI_KEY, "country":"bg", "category": "sports", "language": "en", "sortBy": "publishedAt"}
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url, params=params)
    r.raise_for_status()
    return r.json()


def build_prompt(weather_json, news_json, preferences):
    main = weather_json.get("weather", [{}])[0].get("main", "Unknown")
    temp = weather_json.get("main", {}).get("temp", "Unknown")
    pop = weather_json.get("rain", {}).get("1h", 0)
    weather_summary = f"{main}, {temp}°C, precipitation_prob={pop}"

    headlines = []
    for article in news_json.get("articles", [])[:5]:
        title = article.get("title")
        if title:
            headlines.append(title)
    news_block = "\n".join([f"- {h}" for h in headlines]) or "No major headlines."

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
    # Currently only huggingface router path implemented (keeps your previous logic).
    # You can add an 'openai' branch if you prefer using OpenAI.
    if LLM_PROVIDER == "huggingface":
        if not LLM_API_KEY:
            raise RuntimeError("LLM_API_KEY not set")
        client = OpenAI(base_url="https://router.huggingface.co/v1", api_key=LLM_API_KEY)
        completion = client.chat.completions.create(
            model="deepseek-ai/DeepSeek-V3.2-Exp:novita",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=500,
        )
        data = completion.choices[0].message.content
        # try parse to JSON
        try:
            parsed = json.loads(data)
            return parsed
        except json.JSONDecodeError:
            return {"raw": data}
    else:
        raise RuntimeError("Unsupported LLM_PROVIDER")


# --------------------
# Authentication routes (use ODMantic engine)
# --------------------
@app.post("/auth/register")
async def register(user: UserCreate):
    # check exists
    existing = await engine.find_one(User, User.email == user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = hash_password(user.password)
    user_doc = User(email=user.email, hashed_password=hashed_password, full_name=user.full_name)
    await engine.save(user_doc)
    return {"msg": "User created successfully"}


@app.post("/auth/login")
async def login(user: UserLogin):
    db_user = await engine.find_one(User, User.email == user.email)
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # create token using user.id
    token = create_access_token({"sub": str(db_user.id)})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/users/me", response_model=UserResponse)
async def users_me(current_user: User = Depends(get_current_user_required)):
    return UserResponse(id=str(current_user.id), email=current_user.email, full_name=current_user.full_name)


# --------------------
# Health
# --------------------
@app.get("/health")
async def health():
    return {"status": "ok"}


# --------------------
# Weather / News endpoints (public)
# --------------------
@app.get("/api/weather")
async def weather(lat: float = Query(...), lon: float = Query(...)):
    try:
        return await fetch_weather(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.get("/api/news")
async def news(lat: float = Query(...), lon: float = Query(...)):
    try:
        location_name = await reverse_geocode(lat, lon)
        return await fetch_news(location_name)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


# --------------------
# Plan generation (public). If Authorization header has a valid token,
# the generated plan will be saved for that user automatically.
# --------------------
@app.post("/api/plan")
async def plan(req: PlanRequest, request: Request, current_user: Optional[User] = Depends(get_current_user_optional)):
    try:
        # 1) fetch weather
        weather = await fetch_weather(req.lat, req.lon)

        # 2) location name
        location_name = await reverse_geocode(req.lat, req.lon)

        # 3) fetch news
        news = await fetch_news(location_name)

        # 4) build prompt & call LLM
        prompt = build_prompt(weather, news, req.preferences)
        llm_resp = await call_llm(prompt)

        # 5) if user logged in, save plan to DailyPlan collection
        if current_user:
            plan_doc = DailyPlan(user_id=current_user.id, location_name=location_name, plan=llm_resp)
            await engine.save(plan_doc)

        return {"plan": llm_resp, "location_name": location_name}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------------------
# User plan history (protected)
# --------------------
@app.get("/api/plan/history")
async def plan_history(current_user: User = Depends(get_current_user_required)):
    try:
        plans = await engine.find(DailyPlan, DailyPlan.user_id == current_user.id)
        # sort descending by created_at
        plans_sorted = sorted(plans, key=lambda p: p.created_at, reverse=True)
        # convert to JSON-serializable structure
        out = []
        for p in plans_sorted:
            out.append(
                {
                    "id": str(p.id),
                    "location_name": p.location_name,
                    "created_at": p.created_at.isoformat(),
                    "plan": p.plan,
                }
            )
        return {"plans": out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
