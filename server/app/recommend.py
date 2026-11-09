import logging
from datetime import datetime, timedelta

from pydantic import BaseModel, Field

from app.geo import distance_km, forward_geocode, place_coordinates, reverse_geocode, route_between
from app.planner import parse_model

logger = logging.getLogger("ParijAI")


class LocationIn(BaseModel):
    lat: float
    lng: float


class RecommendIn(BaseModel):
    location: LocationIn
    cityName: str | None = None
    availableTimeMinutes: int = Field(ge=60, le=14 * 24 * 60)
    budgetINR: float = Field(ge=0)
    groupType: str
    groupSize: int = Field(default=1, ge=1, le=50)
    preferences: list[str] | None = None


class PlaceDraft(BaseModel):
    name: str
    description: str
    category: str
    estimatedCostPerPerson: int = Field(ge=0)
    estimatedTimeToSpend: int = Field(ge=15, le=480)
    rating: float = Field(ge=0, le=5)
    reasonToVisit: str
    seasonalNote: str
    tags: list[str]
    score: int = Field(ge=0, le=100)


class PlacesDraft(BaseModel):
    places: list[PlaceDraft]


class SelectedPlace(BaseModel):
    name: str
    location: LocationIn


class RoutesIn(BaseModel):
    origin: LocationIn
    selectedPlaces: list[SelectedPlace]


class PlaceIn(BaseModel):
    name: str
    description: str
    category: str
    location: LocationIn
    estimatedCostPerPerson: float
    estimatedTimeToSpend: int
    rating: float
    reasonToVisit: str
    seasonalNote: str | None = None
    festiveRelevance: str | None = None
    tags: list[str] = []
    score: float
    imageSearchQuery: str | None = None


class RouteIn(BaseModel):
    mode: str
    duration: float
    estimatedCost: float
    distance: float
    steps: list[str] = []
    localTip: str | None = None
    recommended: bool = False


class AggregateIn(BaseModel):
    places: list[PlaceIn]
    routes: dict[str, list[RouteIn]]
    request: RecommendIn


class TripCopy(BaseModel):
    summary: str
    tips: list[str]


_ADMIN_WORDS = {
    "district",
    "division",
    "county",
    "taluk",
    "tehsil",
    "block",
    "subdivision",
    "sub-division",
    "circle",
    "municipality",
}


def _place_label(raw: str) -> str:
    parts = [part.strip() for part in raw.split(",") if part.strip()]
    local = []
    for part in parts:
        words = {word.strip(".").lower() for word in part.split()}
        if words & _ADMIN_WORDS or words <= {"india", "bharat"}:
            continue
        local.append(part)
    if local:
        return ", ".join(local[:2])
    return parts[0] if parts else raw.strip()


def _duration_phrase(minutes: int) -> str:
    days, rest = divmod(minutes, 1440)
    hours = rest // 60
    if days and hours:
        return f"{days} days {hours} hours"
    if days == 1:
        return "1 day"
    if days:
        return f"{days} days"
    if hours == 1:
        return "1 hour"
    return f"{hours} hours"


def _city_label(body: RecommendIn) -> str:
    if body.cityName and body.cityName.strip():
        return _place_label(body.cityName)
    try:
        return _place_label(reverse_geocode(body.location.lat, body.location.lng))
    except Exception:
        logger.info("city lookup failed, continuing with coordinates")
        return f"{body.location.lat:.3f}, {body.location.lng:.3f}"


def find_places(body: RecommendIn) -> list[dict]:
    city = _city_label(body)
    prefs = ", ".join(body.preferences or []) or "a mix of landmarks, food, and local life"
    def ask(extra: str = "") -> PlacesDraft:
        return parse_model(
            PlacesDraft,
            (
                "You recommend real places a visitor can go to today. "
                "Use the place's common public name so a map search can find it. "
                "Costs are Indian rupees per person. Times are minutes spent at the place. "
                "Keep every text field to one short sentence."
            ),
            (
                f"Place: {city}\n"
                f"Map label: {body.cityName or city}\n"
                f"Coordinates: {body.location.lat:.4f}, {body.location.lng:.4f}\n"
                f"Trip length: {_duration_phrase(body.availableTimeMinutes)} ({body.availableTimeMinutes} minutes)\n"
                f"Budget: {int(body.budgetINR)} INR total for {body.groupSize} {body.groupType} travelers\n"
                f"Interests: {prefs}\n"
                "Return 6 real places within 80 km of these coordinates. "
                "Do not switch to another region that merely shares part of the name. "
                "Do not invent venues."
                f"{extra}"
            ),
            max_tokens=4096,
        )

    draft = ask()
    near = {"lat": body.location.lat, "lng": body.location.lng}

    def pin(items: list[PlaceDraft]) -> list[dict]:
        pinned = []
        for item in items:
            try:
                coords = place_coordinates(item.name, city, near)
            except Exception:
                logger.info("map lookup failed for %s", item.name)
                continue
            if coords is None:
                logger.info("dropped %s, no map match in %s", item.name, city)
                continue
            pinned.append(
                {
                    "name": item.name,
                    "description": item.description,
                    "category": item.category,
                    "location": coords,
                    "estimatedCostPerPerson": item.estimatedCostPerPerson,
                    "estimatedTimeToSpend": item.estimatedTimeToSpend,
                    "rating": round(item.rating, 1),
                    "reasonToVisit": item.reasonToVisit,
                    "seasonalNote": item.seasonalNote,
                    "tags": item.tags[:4],
                    "score": item.score,
                }
            )
        return pinned

    places = pin(draft.places)
    if len(places) < 2:
        missed = ", ".join(item.name for item in draft.places)
        draft = ask(
            f"\nThese names were not on the map near the coordinates: {missed}. "
            "Choose different well-known places in the same area."
        )
        places = pin(draft.places)
    places.sort(key=lambda place: place["score"], reverse=True)
    if len(places) < 2:
        raise RuntimeError(f"Could not pin enough real places in {city}")
    return places[:6]


def _fallback_leg(origin: dict, dest: dict, kmh: float) -> dict:
    km = max(0.2, distance_km(origin, dest))
    return {"distance": round(km, 1), "duration": max(1, round(km / kmh * 60))}


def _modes(origin: dict, dest: dict) -> list[dict]:
    walk = route_between(origin, dest, "foot") or _fallback_leg(origin, dest, 4.5)
    drive = route_between(origin, dest, "driving") or _fallback_leg(origin, dest, 22)
    km = drive["distance"]
    cab_cost = 0 if km < 0.4 else max(40, round(km * 18))
    recommend_walk = walk["distance"] <= 1.8 and walk["duration"] <= 25
    options = [
        {
            "mode": "walk",
            "duration": walk["duration"],
            "estimatedCost": 0,
            "distance": walk["distance"],
            "steps": ["Follow the walking route from your previous stop."],
            "localTip": "Start earlier if the afternoon is hot.",
            "recommended": recommend_walk,
        },
        {
            "mode": "cab",
            "duration": drive["duration"],
            "estimatedCost": cab_cost,
            "distance": drive["distance"],
            "steps": ["Ask for the meter, or confirm the fare before you leave."],
            "localTip": "A cab is the simpler choice once the walk is past about 2 km.",
            "recommended": not recommend_walk,
        },
    ]
    if walk["distance"] <= 6:
        cycle = route_between(origin, dest, "bike") or _fallback_leg(origin, dest, 14)
        options.append(
            {
                "mode": "cycle",
                "duration": cycle["duration"],
                "estimatedCost": 0,
                "distance": cycle["distance"],
                "steps": ["Use a marked cycle lane where the city has one."],
                "localTip": "Only practical if you already have a bicycle.",
                "recommended": False,
            }
        )
    return options


def find_routes(body: RoutesIn) -> dict[str, list[dict]]:
    origin = body.origin.model_dump()
    routes: dict[str, list[dict]] = {}
    cursor = origin
    for place in body.selectedPlaces:
        dest = place.location.model_dump()
        routes[place.name] = _modes(cursor, dest)
        cursor = dest
    return routes


def _clock(start: datetime, minutes: int) -> datetime:
    return start + timedelta(minutes=minutes)


def _stamp(start: datetime, moment: datetime, show_day: bool) -> str:
    clock = moment.strftime("%H:%M")
    if not show_day:
        return clock
    day = (moment.date() - start.date()).days + 1
    return f"Day {day} {clock}"


def _order(origin: dict, places: list[PlaceIn]) -> list[PlaceIn]:
    remaining = list(places)
    ordered: list[PlaceIn] = []
    cursor = origin
    while remaining:
        nxt = min(remaining, key=lambda place: distance_km(cursor, place.location.model_dump()))
        ordered.append(nxt)
        remaining.remove(nxt)
        cursor = nxt.location.model_dump()
    return ordered


def aggregate(body: AggregateIn) -> dict:
    origin = body.request.location.model_dump()
    ordered = _order(origin, body.places)
    chosen: dict[str, RouteIn] = {}
    for name, options in body.routes.items():
        picked = next((route for route in options if route.recommended), None)
        chosen[name] = picked or (options[0] if options else None)

    start = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0)
    clock = start
    staged = []
    transport = 0
    tickets = 0
    for index, place in enumerate(ordered, start=1):
        route = chosen.get(place.name)
        if route is not None:
            clock = _clock(clock, int(route.duration))
            transport += route.estimatedCost
        arrival = clock
        clock = _clock(clock, place.estimatedTimeToSpend)
        tickets += place.estimatedCostPerPerson * body.request.groupSize
        staged.append(
            {
                "order": index,
                "place": place.model_dump(),
                "route": route.model_dump() if route is not None else None,
                "arrival": arrival,
                "departure": clock,
            }
        )

    show_day = any(
        item["arrival"].date() != start.date() or item["departure"].date() != start.date()
        for item in staged
    )
    items = [
        {
            "order": item["order"],
            "place": item["place"],
            "route": item["route"],
            "estimatedArrival": _stamp(start, item["arrival"], show_day),
            "estimatedDeparture": _stamp(start, item["departure"], show_day),
        }
        for item in staged
    ]

    names = ", ".join(place.name for place in ordered)
    city = _city_label(body.request)
    try:
        copy = parse_model(
            TripCopy,
            "Write a short, concrete travel note. No markdown.",
            (
                f"City: {city}. Group: {body.request.groupSize} {body.request.groupType}. "
                f"Stops in order: {names}. "
                f"Budget {int(body.request.budgetINR)} INR. "
                "summary is two sentences. tips is exactly 3 practical tips."
            ),
            max_tokens=1024,
        )
        summary = copy.summary
        tips = copy.tips[:4]
    except Exception:
        logger.exception("summary failed for %s", city)
        summary = f"A {body.request.groupType} plan for {city}, moving through {names}."
        tips = [
            "Keep the first stop for the morning, before the popular sites fill up.",
            "Carry small cash for tickets and short cab rides.",
            "Leave a little slack between stops so one delay does not wreck the day.",
        ]

    total_time = sum(place.estimatedTimeToSpend for place in ordered)
    total_time += sum(int(route.duration) for route in chosen.values() if route is not None)
    return {
        "summary": summary,
        "itinerary": items,
        "totalEstimatedCost": int(tickets + transport),
        "totalEstimatedTime": total_time,
        "budgetBreakdown": [
            {"category": "Entries and food", "amount": int(tickets)},
            {"category": "Local transport", "amount": int(transport)},
        ],
        "tips": tips,
    }


def resolve_forward(query: str) -> dict | None:
    return forward_geocode(query)
