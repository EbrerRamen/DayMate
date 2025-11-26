from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from app.db import engine
from app.models import User, DailyPlan
from app.schemas.plan import PlanRequest
from app.services.weather import fetch_weather, reverse_geocode
from app.services.news import fetch_news
from app.services.llm import build_prompt, call_llm
from app.dependencies.auth import get_current_user_optional, get_current_user_required

router = APIRouter(tags=["plan"])


@router.post("/api/plan")
async def plan(req: PlanRequest, current_user: Optional[User] = Depends(get_current_user_optional)):
    try:
        weather = await fetch_weather(req.lat, req.lon)
        location_name = await reverse_geocode(req.lat, req.lon)
        news = await fetch_news(location_name)
        prompt = build_prompt(weather, news, req.preferences)
        llm_resp = await call_llm(prompt)

        if current_user:
            plan_doc = DailyPlan(user_id=current_user.id, location_name=location_name, plan=llm_resp)
            await engine.save(plan_doc)

        return {"plan": llm_resp, "location_name": location_name}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/api/plan/history")
async def plan_history(current_user: User = Depends(get_current_user_required)):
    try:
        plans = await engine.find(DailyPlan, DailyPlan.user_id == current_user.id)
        plans_sorted = sorted(plans, key=lambda p: p.created_at, reverse=True)
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
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

