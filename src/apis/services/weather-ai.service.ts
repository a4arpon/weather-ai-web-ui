import { ServerENV } from "#app/lib/server/env"

export class WeatherAIError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = "WeatherAIError"
  }
}

export interface WeatherParams {
  lat: number
  lon: number
  days?: number
  ai?: boolean
  units?: "metric" | "imperial"
  lang?: string
}

export interface WeatherGeoParams {
  ip?: string
  days?: number
  ai?: boolean
}

export type WeatherResponse = Record<string, unknown>
export type WeatherGeoResponse = Record<string, unknown>

class WeatherAiSDK {
  private readonly WAiApiKey = ServerENV.WEATHER_AI_KEY
  private readonly WAiBaseUrl = "https://api.weather-ai.co"

  constructor() {}

  private async WAiFetch<T>(
    endpoint: string,
    params: Record<string, string | number | boolean | undefined> = {}
  ): Promise<T> {
    const url = new URL(`${this.WAiBaseUrl}${endpoint}`)

    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v))
    }

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${this.WAiApiKey}` }
    })

    if (!res.ok) {
      let msg = res.statusText
      try {
        msg = (await res.json())?.message ?? msg
      } catch {
        // ignore
      }
      throw new WeatherAIError(res.status, msg)
    }

    return res.json() as Promise<T>
  }

  getWeather(params: WeatherParams) {
    return this.WAiFetch<WeatherResponse>("/v1/weather", {
      ...params,
      ai: params.ai ?? true,
      units: params.units ?? "metric"
    })
  }

  getWeatherByGeo(params: WeatherGeoParams = {}) {
    return this.WAiFetch<WeatherGeoResponse>("/v1/weather-geo", {
      ip: params.ip ?? "auto",
      days: params.days,
      ai: params.ai ?? true
    })
  }
}

export const weatherAIClient = new WeatherAiSDK()
