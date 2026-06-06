import { Hono } from "hono"

import { BadRequestError, response } from "#app/lib/server/api-utils"
import { apiRouteDoc, openApiQueryParam } from "#app/lib/server/dev-middlewares"

import { defaultCacheDriver } from "../services/cache-driver"
import { weatherAIClient } from "../services/weather-ai.service"

export const weatherRoutes = new Hono().basePath("weather")

weatherRoutes.get(
  "current",

  apiRouteDoc({
    tag: "Weather",
    parameters: [
      openApiQueryParam("string", "lat", "Latitude"),
      openApiQueryParam("string", "lon", "Longitude"),
      openApiQueryParam("number", "days", "Days to forecast. Default is 1", [
        "1",
        "7",
        "14",
        "30"
      ]),
      openApiQueryParam("string", "units", "Units. Default is metric", [
        "metric",
        "imperial"
      ]),
      openApiQueryParam("string", "ai", "AI Mode. Default is false", [
        "true",
        "false"
      ])
    ]
  }),

  async (ctx) => {
    const lat = ctx.req.query("lat")
    const lon = ctx.req.query("lon")
    const days = ctx.req.query("days") ?? "1"
    const units = ctx.req.query("units") ?? "metric"
    const ai = ctx.req.query("ai") ?? "false"

    if (!lat || !lon) {
      throw new BadRequestError("lat and lon are required")
    }

    const cacheKey = `weather:${lat}:${lon}:${days}:${units}`

    const cached = await defaultCacheDriver.get(cacheKey)

    if (cached)
      return ctx.json(
        response({
          data: cached,
          extra: {
            fromCache: true
          }
        })
      )

    const data = await weatherAIClient.getWeather({
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      days: parseInt(days),
      units: units as "metric" | "imperial",
      ai: ai === "true"
    })

    await defaultCacheDriver.set(cacheKey, data, 600)

    return ctx.json(
      response({
        data: data,
        extra: {
          fromCache: false
        }
      })
    )
  }
)

weatherRoutes.get(
  "geo",

  apiRouteDoc({
    tag: "Weather",
    parameters: [
      openApiQueryParam("string", "ip", "IP Address"),
      openApiQueryParam("number", "days", "Days to forecast. Default is 1", [
        "1",
        "7",
        "14",
        "30"
      ]),
      openApiQueryParam("string", "ai", "AI Mode. Default is false", [
        "true",
        "false"
      ])
    ]
  }),

  async (ctx) => {
    const ip = ctx.req.query("ip")
    const days = ctx.req.query("days") ?? "1"
    const ai = ctx.req.query("ai") ?? "false"

    if (!ip) {
      throw new BadRequestError("ip is required")
    }

    const cacheKey = `weather-geo:${ip}:${days}:${ai}`

    const cached = await defaultCacheDriver.get(cacheKey)

    if (cached)
      return ctx.json(
        response({
          data: cached,
          extra: {
            fromCache: true
          }
        })
      )

    const data = await weatherAIClient.getWeatherByGeo({
      ip: ip,
      days: parseInt(days),
      ai: ai === "true"
    })

    await defaultCacheDriver.set(cacheKey, data, 600)

    return ctx.json(
      response({
        data: data,
        extra: {
          fromCache: false
        }
      })
    )
  }
)
