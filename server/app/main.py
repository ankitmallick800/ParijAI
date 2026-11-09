import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import AuthenticationError

from app.config import settings
from app.geo import reverse_geocode
from app.planner import generate_plan
from app.recommend import (
    AggregateIn,
    RecommendIn,
    RoutesIn,
    aggregate,
    find_places,
    find_routes,
    resolve_forward,
)
from app.schemas import PlanRequest, TravelPlan
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ParijAI")

app = FastAPI(title="ParijAI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://[::1]:5173",
    ],
    allow_origin_regex=r"https://[a-zA-Z0-9-]+\.github\.io",
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.get("/api/health")
def health() -> dict[str, str | bool]:
    return {
        "ok": True,
        "model": settings.groq_model,
        "ai_configured": bool(settings.groq_api_key.strip()),
    }


class ForwardIn(BaseModel):
    query: str = Field(min_length=2, max_length=120)


class ReverseIn(BaseModel):
    lat: float
    lng: float


@app.post("/api/geocode/forward")
def geocode_forward(body: ForwardIn) -> dict:
    hit = resolve_forward(body.query)
    if hit is None:
        raise HTTPException(status_code=404, detail=f"No place found for {body.query}.")
    return {"success": True, "data": hit}


@app.post("/api/geocode/reverse")
def geocode_reverse(body: ReverseIn) -> dict:
    return {"success": True, "data": {"cityName": reverse_geocode(body.lat, body.lng)}}


def _planner_error(exc: Exception, fallback: str) -> HTTPException:
    if isinstance(exc, AuthenticationError):
        return HTTPException(
            status_code=401,
            detail="Groq rejected GROQ_API_KEY. Create a new key at console.groq.com, replace it in the project .env, and restart the API.",
        )
    logger.exception("planner failed")
    return HTTPException(status_code=502, detail=fallback)


@app.post("/api/recommend/places")
def recommend_places(body: RecommendIn) -> dict:
    if not settings.groq_api_key.strip():
        raise HTTPException(status_code=503, detail="Add GROQ_API_KEY to the project .env and restart the API.")
    try:
        return {"success": True, "data": find_places(body)}
    except Exception as exc:
        raise _planner_error(exc, "The place finder could not build a list. Try again.") from None


@app.post("/api/recommend/routes")
def recommend_routes(body: RoutesIn) -> dict:
    if not body.selectedPlaces:
        raise HTTPException(status_code=400, detail="Select at least one place.")
    try:
        return {"success": True, "data": find_routes(body)}
    except Exception:
        logger.exception("routes failed")
        raise HTTPException(status_code=502, detail="The route finder could not build routes. Try again.") from None


@app.post("/api/recommend/aggregate")
def recommend_aggregate(body: AggregateIn) -> dict:
    if not body.places:
        raise HTTPException(status_code=400, detail="Select at least one place.")
    try:
        return {"success": True, "data": aggregate(body)}
    except Exception:
        logger.exception("aggregate failed")
        raise HTTPException(status_code=502, detail="The itinerary could not be built. Try again.") from None


@app.post("/api/plan", response_model=TravelPlan)
def create_plan(body: PlanRequest) -> TravelPlan:
    if not settings.groq_api_key.strip():
        raise HTTPException(
            status_code=503,
            detail="Add GROQ_API_KEY to the project .env and restart the API.",
        )
    try:
        return generate_plan(body)
    except Exception:
        logger.exception("plan failed for %s", body.destination)
        raise HTTPException(
            status_code=502,
            detail="The planner could not build this trip. Try again in a moment.",
        ) from None
