import time

from openai import APIConnectionError, APIStatusError, APITimeoutError, OpenAI, RateLimitError

from app.config import settings
from app.schemas import PlanRequest, TravelPlan

SYSTEM_PROMPT = (
    "You are a practical travel planner. Build a realistic day-by-day itinerary "
    "for the destination the traveler named. Prefer well-known places that a "
    "visitor can actually go to. Costs are in Indian rupees for the whole group. "
    "Keep each day in one area so the transfers are plausible. Order stops by time. "
    "Do not add flights unless the notes ask for them."
)

_client: OpenAI | None = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=settings.groq_api_key,
            base_url="https://api.groq.com/openai/v1",
            timeout=120.0,
        )
    return _client


def build_user_prompt(request: PlanRequest) -> str:
    notes = request.notes or "None"
    return (
        f"Destination: {request.destination}\n"
        f"Days: {request.days}\n"
        f"Total budget: {request.budget_inr} INR for the whole group\n"
        f"Travelers: {request.travelers}, {request.people} people\n"
        f"Interests: {', '.join(request.interests)}\n"
        f"Extra notes: {notes}\n"
        "Return exactly that many days. Use real places in this destination. "
        "Keep the sum of stop costs near the budget, without going far over it. "
        "Keep every description and tip to one short sentence."
    )


def _retryable(exc: Exception) -> bool:
    if isinstance(exc, (APIConnectionError, APITimeoutError, RateLimitError, RuntimeError)):
        return True
    return isinstance(exc, APIStatusError) and exc.status_code >= 500


def parse_model(model_type: type, system: str, user: str, max_tokens: int = 4096):
    last_error: Exception | None = None
    for attempt in range(2):
        try:
            completion = get_client().beta.chat.completions.parse(
                model=settings.groq_model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                response_format=model_type,
                reasoning_effort="low",
                max_completion_tokens=max_tokens,
                temperature=0.4,
            )
            parsed = completion.choices[0].message.parsed
            if parsed is None:
                raise RuntimeError("Model returned an empty response")
            return parsed
        except Exception as exc:
            last_error = exc
            if attempt == 1 or not _retryable(exc):
                raise
            time.sleep(1.2)
    raise last_error or RuntimeError("Model request failed")


def generate_plan(request: PlanRequest) -> TravelPlan:
    # gpt-oss spends the default token budget on reasoning and then
    # truncates the itinerary JSON. Low effort plus a larger cap leaves
    # room for the full plan.
    return parse_model(TravelPlan, SYSTEM_PROMPT, build_user_prompt(request), max_tokens=8192)
