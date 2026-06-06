import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../ui/card"

export function ProjectInfo() {
  return (
    <Card className="border-primary/20 mt-6">
      <CardHeader>
        <CardTitle>About This Project &amp; Tech Stack</CardTitle>
        <CardDescription>
          WeatherAI API integration - clean architecture, caching, and
          scalability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <span className="font-semibold">Project purpose:</span> A single-page
          weather dashboard that consumes the WeatherAI API, demonstrates modern
          React patterns, and includes server-side caching to handle scaling
          challenges.
        </div>

        <div>
          <span className="font-semibold">Tech stack:</span>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>
              Frontend: React 19 + Vite, Tailwind CSS 4, shadcn/ui, Lucide icons
            </li>
            <li>
              Data fetching: TanStack Query, Recharts for temperature/UV trends
            </li>
            <li>Backend (BFF): Nitro 3 (Vercel preset), Hono.js routes</li>
            <li>
              Caching: Redis (ioredis) with manual TTL (600s for weather, 300s
              for geo)
            </li>
            <li>Geocoding: Open-Meteo (free, no API key)</li>
            <li>Deployment: Vercel</li>
          </ul>
        </div>

        <div>
          <span className="font-semibold">Architecture highlights:</span>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>
              Backend-for-frontend (BFF) pattern - API key stays server-side.
            </li>
            <li>
              Redis cache reduces WeatherAI API calls and respects monthly
              quotas.
            </li>
            <li>
              Cache keys include location, days, units - separate cache for IP
              geo lookup.
            </li>
            <li>
              React Context for global location state, debounced city search.
            </li>
            <li>Responsive UI with skeleton loaders and error boundaries.</li>
          </ul>
        </div>

        <div>
          <span className="font-semibold">Scaling considerations:</span>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>
              Stateless serverless functions + external Redis = persistent
              cache.
            </li>
            <li>
              TTL of 10 minutes balances freshness and upstream request
              reduction.
            </li>
            <li>
              Open-Meteo geocoding avoids extra API key and third-party costs.
            </li>
            <li>
              React Query deduplicates concurrent requests and provides
              stale-while-revalidate.
            </li>
            <li>Vercel + Redis (Upstash) ready for production scale.</li>
          </ul>
        </div>

        <div className="border-t pt-3 text-xs">
          Built as a task challenge for Weather-AI Labs - demonstrating API
          integration, caching strategy, and modular frontend architecture.
        </div>
      </CardContent>
    </Card>
  )
}
