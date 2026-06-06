import { ExternalLink, Mail, MapPin } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../ui/card"

export function DeveloperCard() {
  return (
    <Card className="border-primary/20 mt-12">
      <CardHeader>
        <CardTitle>Built by Xia</CardTitle>
        <CardDescription>Full-stack Back-end developer</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            <a href="mailto:a4arpon@gmail.com" className="hover:text-primary">
              a4arpon@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>Changsha, China</span>
          </div>
        </div>

        <div className="flex gap-3">
          <a
            href="https://github.com/a4arpon"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm"
          >
            <ExternalLink className="h-4 w-4" /> GitHub
          </a>
          <a
            href="https://linkedin.com/in/a4arpon"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm"
          >
            <ExternalLink className="h-4 w-4" /> LinkedIn
          </a>
        </div>

        <div className="text-muted-foreground border-t pt-3 text-xs">
          <p>
            Experience with high-throughput backends, Redis caching,
            microservices, and real-time APIs. Built multi-tenant SaaS on Deno +
            Hono + PostgreSQL, and server-side tracking systems. This weather
            dashboard showcases API integration, caching strategies (Redis), and
            modular React architecture.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
