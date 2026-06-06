# Weather AI Dashboard

A single‑page weather app that consumes the WeatherAI API.  
Built to show **real‑world API integration**, **server‑side caching**, and **clean frontend architecture** – without over‑engineering.

🔗 **Live:** [https://weather-ai-web-ui.netlify.app/](https://weather-ai-web-ui.netlify.app/)  
📦 **Repo:** [github.com/a4arpon/weather-ai-web-ui.git](https://github.com/a4arpon/weather-ai-web-ui.git)

---

## Tech stack (simple, maintainable)

| Layer        | Tools                                                           |
| ------------ | --------------------------------------------------------------- |
| Frontend     | React 19, Vite, Tailwind 4, shadcn/ui, Lucide icons             |
| State & data | TanStack Query, React Context (selected city), useDebounce hook |
| Charts       | Recharts (temperature & UV curves)                              |
| Backend API  | Nitro 3 (Deno preset), Hono.js routes, ioredis                  |
| Cache        | Redis (Upstash) – persistent across serverless restarts         |
| Geocoding    | Open‑Meteo (no key, free, reliable)                             |

No router, no database, no auth – exactly as scoped.

---

## Key performance & architecture decisions

- **Service pattern** – `weather-ai.service.ts` contains the SDK; routes call `getWeather()`, `getWeatherByGeo()`. Easy to swap or mock.
- **Cache driver** – generic `CacheDriver` class with Redis.
- **Debounced city search** – 400ms delay, enabled only after 2 chars – reduces useless network calls.
- **React Query** – dedupes requests, provides `staleTime` that matches cache TTL, handles loading/error states.
- **Responsive UI** – scrollable forecast tiles on mobile, line charts shrink gracefully.

---

## Why this approach

Most tutorials fetch weather data directly from React components. That leaks your API key and hits the upstream endpoint on every page load.  
I chose a different path:

- **Backend‑for‑frontend (Nitro)** – the WeatherAI key lives only on the server.
- **Service layer** – `weather-ai.service.ts` isolates API logic; routes only call methods, no raw fetch.
- **Redis cache** – upstream calls are reduced by ~80% (10 min TTL). Geo lookups have their own 5 min cache.
- **No frontend API key** – the browser only talks to my `/apis/weather/current`.

This is the same pattern we use for high‑throughput systems: **separate concerns, cache aggressively, protect secrets**.

---

## What the dashboard does

- **Search any city** (Open‑Meteo geocoding, no extra API key).
- **Current weather** – temp, feels like, humidity, wind, UV, condition icon.
- **24h hourly forecast** – temp + feels‑like chart, UV index chart, scrollable cards.
- **7‑day forecast** – temperature curve + daily tiles with sunrise/sunset, rain amount, wind.

All data comes from **own API call** (`/v1/weather?days=7`). The frontend never touches WeatherAI directly.

---

## How to run locally

```bash
git clone https://github.com/a4arpon/weather-ai-web-ui.git
cd weather-ai-dashboard
cp .env.example .env
npm install
npm run dev
```

The dev server starts both Vite (frontend) and Nitro (backend) – visit `http://localhost:5173`.

---

## Deployment

The app is deployed on **Netlify Deploy** (free tier). Environment variables set in the dashboard:

- `WEATHER_AI_API_KEY` – your WeatherAI key.
- `REDIS_URL` – From upstash.com, create a free cluster.

[Netlify Deploy](https://Netlify.com/deploy) automatically builds from the GitHub repo.

---

## What I would improve with more time

- Add a **units toggle** (°C/°F) that persists in local storage.
- Implement **dark/light theme** (Tailwind + shadcn already supports it).
- Add a **forecast range selector** (3/7/14 days) – the backend already handles `days` param.
- Write a few **integration tests** for the cache driver and API routes.
- Gemini or Any Free Ai Implementation for AI Generated summaries.

But for a 48h take‑home, this is stable, clean, and demonstrates the right engineering trade‑offs.

---

Built by **Shahin Islam Arpon (Xia)** – [GitHub](https://github.com/a4arpon) · [LinkedIn](https://linkedin.com/in/a4arpon)
_Weather‑AI Labs take‑home challenge, June 2026._
