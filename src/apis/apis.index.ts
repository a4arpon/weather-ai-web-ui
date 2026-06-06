import { Hono } from "hono"
import { openAPIRouteHandler } from "hono-openapi"
import { rateLimiter } from "hono-rate-limiter"
import { compress } from "hono/compress"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { logger } from "hono/logger"
import { secureHeaders } from "hono/secure-headers"

import { honoConf } from "#app/lib/server/api-config"
import { errorHandler } from "#app/lib/server/api-utils"
import { apiRouteDoc } from "#app/lib/server/dev-middlewares"

import { weatherRoutes } from "./routes/weather"

export const apisEntrypoint = new Hono().basePath("apis")

/**
 * --------------------------------------------------------
 * Middleware
 * --------------------------------------------------------
 */

apisEntrypoint.use(logger())
apisEntrypoint.use(cors(honoConf.corsConfig))
apisEntrypoint.use(secureHeaders(honoConf.secureHeadersConfig))
apisEntrypoint.use(
  compress({
    encoding: "gzip"
  })
)
apisEntrypoint.use(rateLimiter(honoConf.rateLimiterConfig))

/**
 * --------------------------------------------------------
 * Api End Points
 * --------------------------------------------------------
 */

apisEntrypoint.get("/", apiRouteDoc({ tag: "Api" }), async (ctx) => {
  const { getRuntimeKey } = await import("hono/adapter")
  return ctx.json({ message: "Hello World", runtime: getRuntimeKey() })
})

apisEntrypoint.route("/", weatherRoutes)

/**
 * --------------------------------------------------------
 * Error Handling
 * --------------------------------------------------------
 */

apisEntrypoint.onError(errorHandler)
apisEntrypoint.notFound(() => {
  throw new HTTPException(404, {
    message: "Api Route not found"
  })
})

/**
 * --------------------------------------------------------
 * OpenAPI
 * --------------------------------------------------------
 */

apisEntrypoint.get(
  "/openapi",

  openAPIRouteHandler(apisEntrypoint, {
    documentation: {
      info: {
        title: "Api Docs",
        version: "1.0.0"
      }
    }
  })
)

apisEntrypoint.get("/docs", (ctx) => {
  const doc = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="SwaggerUI" />
      <title>SwaggerUI</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    </head>
    <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/apis/openapi',
          dom_id: '#swagger-ui',
        });
      };
    </script>
    </body>
    </html>
  `

  return ctx.html(doc)
})

console.log("Api Server booted at:", new Date()?.toLocaleTimeString())

/**
 * --------------------------------------------------------
 * Start Server
 * --------------------------------------------------------
 */

export default {
  fetch: apisEntrypoint.fetch
}
