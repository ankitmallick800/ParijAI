from typing import Literal

from pydantic import BaseModel, Field, field_validator

Travelers = Literal["solo", "couple", "family", "friends"]

ALLOWED_INTERESTS = (
    "food",
    "culture",
    "nature",
    "nightlife",
    "shopping",
    "history",
    "adventure",
    "relax",
)


class PlanRequest(BaseModel):
    destination: str = Field(min_length=2, max_length=80)
    days: int = Field(ge=1, le=7)
    budget_inr: int = Field(ge=500, le=5_000_000)
    travelers: Travelers
    people: int = Field(ge=1, le=12)
    interests: list[str] = Field(min_length=1, max_length=5)
    notes: str = Field(default="", max_length=300)

    @field_validator("destination", "notes")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return " ".join(value.split())

    @field_validator("interests")
    @classmethod
    def known_interests(cls, value: list[str]) -> list[str]:
        cleaned: list[str] = []
        for item in value:
            key = item.strip().lower()
            if key not in ALLOWED_INTERESTS:
                raise ValueError(f"Unknown interest: {item}")
            if key not in cleaned:
                cleaned.append(key)
        if not cleaned:
            raise ValueError("Pick at least one interest")
        return cleaned


class Stop(BaseModel):
    time: str = Field(description="Local start time, like 09:30")
    name: str = Field(description="A real place in the destination")
    area: str = Field(description="Neighborhood or district")
    description: str = Field(description="One or two sentences on what to do there")
    duration: str = Field(description="How long to spend, like 90 minutes")
    estimated_cost_inr: int = Field(
        ge=0,
        description="Estimated spend in INR for the whole group at this stop",
    )
    tip: str = Field(description="One practical local tip")


class DayPlan(BaseModel):
    day: int = Field(ge=1, le=7)
    title: str = Field(description="Short theme for the day")
    summary: str = Field(description="One sentence on how the day flows")
    stops: list[Stop] = Field(min_length=3, max_length=5)


class TravelPlan(BaseModel):
    destination: str
    headline: str = Field(description="Short trip title")
    summary: str = Field(description="Two or three sentences on the shape of the trip")
    total_estimated_cost_inr: int = Field(ge=0)
    days: list[DayPlan] = Field(min_length=1, max_length=7)
    budget_note: str = Field(description="How the plan sits against the stated budget")
    getting_around: str = Field(description="How to move between stops")
