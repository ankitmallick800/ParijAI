# ParijAI

The original ParijAI site: a landing page, then preferences, places, and routes, then a mapped itinerary. Groq picks the places and writes the summary. OpenStreetMap pins the stops and measures the routes.

The React app lives at the repo root. The API is FastAPI in `server/app`.

## Setup

You need Node.js 18+, Python 3.11+, and a Groq API key from [console.groq.com](https://console.groq.com).

1. Put the key in the project `.env` (the same file the frontend already uses):

   ```env
   GROQ_API_KEY=your_groq_api_key
   GROQ_MODEL=openai/gpt-oss-120b
   ```

   The key stays on the server. It is not sent to the browser.

2. Start the API from the repo root:

   ```bash
   pnpm run dev:api
   ```

   It listens on `http://127.0.0.1:5000`. Docs are at `http://127.0.0.1:5000/docs`.

3. In another terminal, start the app:

   ```bash
   pnpm install
   pnpm run dev
   ```

4. Open `http://localhost:5173`.

## How a plan is made

Search a city, set a budget and interests, then:

1. Groq suggests real places (`POST /api/recommend/places`).
2. OpenStreetMap pins them and routing fills in walk, cab, and cycle options (`POST /api/recommend/routes`).
3. Groq writes the summary, and the server orders the stops into an itinerary (`POST /api/recommend/aggregate`).

The model is `openai/gpt-oss-120b` at `https://api.groq.com/openai/v1`.

Earlier design notes for the multi-agent version are in `docs/documentation.md`. The previous Express server is still in `server/src` and is not what this UI calls.
