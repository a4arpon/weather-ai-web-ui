import type { Context } from "hono"

import { ServerENV } from "./env"

export const honoConf = {
  corsConfig: {
    origin: [ServerENV.APP_URL],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
    methods: ["GET", "POST", "DELETE"]
  },
  rateLimiterConfig: {
    limit: 120, // per minute
    windowMs: 1 * 60 * 1000, // per minute
    keyGenerator: (c: Context) => {
      const forwarded = c.req.header("x-forwarded-for")
      const realIp = c.req.header("x-real-ip")
      const cfConnectingIp = c.req.header("cf-connecting-ip")

      const clientIp =
        forwarded?.split(",")[0]?.trim() ||
        realIp ||
        cfConnectingIp ||
        "unknown"

      return clientIp
    }
  },
  bodyLimitConfig: {
    maxSize: 0.5 * 1024 * 1024, // 500kb
    onError: (c: Context) => {
      return c.json(
        {
          message: "Request body too large",
          data: null,
          extra: {
            route: c.req.url,
            method: c.req.method,
            error: "Request body too large"
          }
        },
        401
      )
    }
  },
  secureHeadersConfig: {
    contentSecurityPolicy: {
      baseUri: ["'self'"]
    },
    xXssProtection: "1; mode=block",
    xFrameOptions: "DENY",
    xContentTypeOptions: "nosniff",
    referrerPolicy: true,
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: true,
    xRobotsTag: "none"
  }
}
