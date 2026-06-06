import {
  Droplets,
  Thermometer,
  Wind,
  Eye,
  Gauge,
  Sun,
  CloudRain,
  CloudSnow,
  Cloud,
  CloudLightning,
  CloudFog,
  HelpCircle
} from "lucide-react"

import { useCurrentLocation } from "#app/hooks/useCurrentLocation"
import type { WeatherApiResponse } from "#app/types/common/weather"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../ui/card"

interface CurrentWeatherProps {
  data: WeatherApiResponse
}

const getWeatherIcon = (conditionCode: string) => {
  const code = parseInt(conditionCode)
  if (code === 0) return <Sun className="h-8 w-8 text-yellow-500" />
  if (code === 1 || code === 2)
    return <Cloud className="h-8 w-8 text-gray-400" />
  if (code === 3) return <Cloud className="h-8 w-8 text-gray-500" />
  if (code >= 45 && code <= 49)
    return <CloudFog className="h-8 w-8 text-gray-400" />
  if (code >= 51 && code <= 59)
    return <CloudRain className="h-8 w-8 text-blue-400" />
  if (code >= 61 && code <= 69)
    return <CloudRain className="h-8 w-8 text-blue-500" />
  if (code >= 71 && code <= 79)
    return <CloudSnow className="h-8 w-8 text-blue-200" />
  if (code >= 95 && code <= 99)
    return <CloudLightning className="h-8 w-8 text-purple-500" />
  return <HelpCircle className="text-muted-foreground h-8 w-8" />
}

export function CurrentWeather({ data }: CurrentWeatherProps) {
  const { location: ctxLocation } = useCurrentLocation()
  if (!data) return null

  const { current, location } = data
  const cityName =
    ctxLocation?.name ||
    `${location.lat.toFixed(2)}°, ${location.lon.toFixed(2)}°`
  const country = location.country ? `, ${location.country}` : ""

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-yellow-500" />
            Current Weather
          </CardTitle>
          <CardDescription>
            {cityName}
            {country}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {getWeatherIcon(current?.condition_code)}
          <span className="text-3xl font-bold">{current?.temperature}°C</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-2">
            <Thermometer className="text-muted-foreground h-4 w-4" />
            <div>
              <p className="text-muted-foreground text-sm">Feels Like</p>
              <p className="text-xl font-semibold">{current?.feels_like}°C</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-400" />
            <div>
              <p className="text-muted-foreground text-sm">Humidity</p>
              <p className="text-xl font-semibold">{current?.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="text-muted-foreground h-4 w-4" />
            <div>
              <p className="text-muted-foreground text-sm">Wind Speed</p>
              <p className="text-xl font-semibold">{current?.wind_speed} m/s</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="text-muted-foreground h-4 w-4" />
            <div>
              <p className="text-muted-foreground text-sm">UV Index</p>
              <p className="text-xl font-semibold">{current?.uv_index}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="text-muted-foreground h-4 w-4" />
            <div>
              <p className="text-muted-foreground text-sm">Condition</p>
              <p className="text-base font-medium capitalize">
                {current?.condition_code.replace("_", " ").toLowerCase()}
              </p>
            </div>
          </div>
          {current?.wind_gust && (
            <div className="flex items-center gap-2">
              <Wind className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-muted-foreground text-sm">Wind Gust</p>
                <p className="text-xl font-semibold">
                  {current?.wind_gust} m/s
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
