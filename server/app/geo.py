import json
import logging
import math
import threading
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

logger = logging.getLogger("ParijAI")

USER_AGENT = "ParijAITravelPlanner/1.0 (local travel planner)"
_last_nominatim = 0.0
_nominatim_lock = threading.Lock()
_cache: dict[str, dict] = {}
_TRANSIENT_HTTP = {429, 500, 502, 503, 504}


def _get_json(url: str, timeout: float = 12, attempts: int = 3) -> dict | list:
    last_error: Exception | None = None
    for attempt in range(attempts):
        request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
        try:
            with urlopen(request, timeout=timeout) as response:
                return json.loads(response.read().decode())
        except HTTPError as exc:
            last_error = exc
            retry = exc.code in _TRANSIENT_HTTP and attempt + 1 < attempts
        except (URLError, TimeoutError, json.JSONDecodeError) as exc:
            last_error = exc
            retry = attempt + 1 < attempts
        if not retry:
            raise last_error
        time.sleep(0.6 * (attempt + 1))
    raise last_error or RuntimeError("map request failed")


def _nominatim(path: str, params: dict) -> list | dict:
    global _last_nominatim
    with _nominatim_lock:
        wait = 1.05 - (time.monotonic() - _last_nominatim)
        if wait > 0:
            time.sleep(wait)
        _last_nominatim = time.monotonic()
        url = f"https://nominatim.openstreetmap.org/{path}?{urlencode(params)}"
        return _get_json(url)


def forward_geocode(query: str) -> dict | None:
    key = f"fwd:{query.strip().lower()}"
    if key in _cache:
        return _cache[key]
    rows = _nominatim(
        "search",
        {"q": query, "format": "jsonv2", "limit": 1},
    )
    if not isinstance(rows, list) or not rows:
        return None
    hit = rows[0]
    result = {
        "lat": float(hit["lat"]),
        "lng": float(hit["lon"]),
        "displayName": hit.get("display_name") or query,
    }
    _cache[key] = result
    return result


def reverse_geocode(lat: float, lng: float) -> str:
    key = f"rev:{lat:.4f},{lng:.4f}"
    if key in _cache:
        return _cache[key]["cityName"]
    data = _nominatim(
        "reverse",
        {"lat": lat, "lon": lng, "format": "jsonv2"},
    )
    address = data.get("address", {}) if isinstance(data, dict) else {}
    city = (
        address.get("city")
        or address.get("town")
        or address.get("village")
        or address.get("state")
        or (data.get("display_name", "").split(",")[0] if isinstance(data, dict) else "")
        or "Unknown"
    )
    _cache[key] = {"cityName": city}
    return city


def _closest(near: dict, hits: list[dict]) -> dict | None:
    close = [hit for hit in hits if _km(near, hit) < 80]
    if not close:
        return None
    return min(close, key=lambda hit: _km(near, hit))


def _photon_hits(query: str, near: dict) -> list[dict]:
    params = urlencode(
        {
            "q": query,
            "limit": 5,
            "lang": "en",
            "lat": near["lat"],
            "lon": near["lng"],
        }
    )
    try:
        data = _get_json(f"https://photon.komoot.io/api?{params}", timeout=8)
    except Exception:
        logger.info("photon lookup failed for %s", query)
        return []
    features = data.get("features") if isinstance(data, dict) else None
    hits = []
    for feature in features or []:
        lon, lat = feature["geometry"]["coordinates"]
        hits.append({"lat": float(lat), "lng": float(lon)})
    return hits


def _nominatim_hits(query: str) -> list[dict]:
    try:
        rows = _nominatim("search", {"q": query, "format": "jsonv2", "limit": 5})
    except Exception:
        logger.info("nominatim lookup failed for %s", query)
        return []
    if not isinstance(rows, list):
        return []
    return [{"lat": float(row["lat"]), "lng": float(row["lon"])} for row in rows]


def place_coordinates(name: str, city: str, near: dict) -> dict | None:
    key = f"place:{name.strip().lower()}|{city.strip().lower()}"
    if key in _cache:
        return _cache[key]
    plain = "".join(ch if ch.isalnum() or ch.isspace() else " " for ch in name)
    plain = " ".join(plain.split())
    queries = [f"{name}, {city}" if city else name]
    if plain and plain.lower() != name.lower():
        queries.append(f"{plain}, {city}" if city else plain)
    for query in queries:
        hit = _closest(near, _photon_hits(query, near))
        if hit is None:
            hit = _closest(near, _nominatim_hits(query))
        if hit is not None:
            _cache[key] = hit
            return hit
    return None


def _km(a: dict, b: dict) -> float:
    radius = 6371.0
    lat1, lat2 = math.radians(a["lat"]), math.radians(b["lat"])
    dlat = lat2 - lat1
    dlng = math.radians(b["lng"] - a["lng"])
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
    return 2 * radius * math.asin(math.sqrt(h))


def distance_km(a: dict, b: dict) -> float:
    return _km(a, b)


def route_between(origin: dict, dest: dict, profile: str) -> dict | None:
    url = (
        "https://router.project-osrm.org/route/v1/"
        f"{profile}/{origin['lng']},{origin['lat']};{dest['lng']},{dest['lat']}"
        "?overview=false"
    )
    try:
        data = _get_json(url, timeout=8)
    except Exception:
        return None
    if not isinstance(data, dict) or data.get("code") != "Ok":
        return None
    leg = data["routes"][0]
    return {
        "distance": round(leg["distance"] / 1000, 1),
        "duration": max(1, round(leg["duration"] / 60)),
    }
