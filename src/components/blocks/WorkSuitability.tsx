import { Sprout, Fish, Construction, CheckCircle } from "lucide-react"

import type { CurrentWeather, HourlyForecast } from "#app/types/common/weather"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

interface Props {
  current: CurrentWeather
  hourly: HourlyForecast[]
}

interface WorkAdvice {
  activity: string
  icon: React.ReactNode
  level: "good" | "moderate" | "caution" | "bad"
  message: string
  detail: string
}

export function WorkSuitability({ current, hourly }: Props) {
  const { temperature, wind_speed, uv_index } = current
  const precipitation_probability = hourly?.[0]?.precipitation_probability ?? 0

  const getFarmingAdvice = (): WorkAdvice => {
    if (precipitation_probability > 80 || wind_speed > 12 || temperature > 38) {
      return {
        activity: "Farming / Field Work",
        icon: <Sprout className="h-5 w-5" />,
        level: "bad",
        message: "Not suitable",
        detail: "Heavy rain, strong wind, or extreme heat – postpone fieldwork"
      }
    }
    if (precipitation_probability > 50 || wind_speed > 8 || temperature > 32) {
      return {
        activity: "Farming / Field Work",
        icon: <Sprout className="h-5 w-5" />,
        level: "caution",
        message: "Limited suitability",
        detail: "Rain or wind may disrupt; take breaks if hot"
      }
    }
    if (temperature < 10) {
      return {
        activity: "Farming / Field Work",
        icon: <Sprout className="h-5 w-5" />,
        level: "moderate",
        message: "Proceed with caution",
        detail: "Cold but manageable – dress warmly"
      }
    }
    return {
      activity: "Farming / Field Work",
      icon: <Sprout className="h-5 w-5" />,
      level: "good",
      message: "Ideal conditions",
      detail: "No weather constraints – good for planting, spraying, harvesting"
    }
  }

  const getFishingAdvice = (): WorkAdvice => {
    if (wind_speed > 10 || precipitation_probability > 70) {
      return {
        activity: "Fishing",
        icon: <Fish className="h-5 w-5" />,
        level: "bad",
        message: "Not recommended",
        detail: "High wind or rain makes fishing dangerous and unproductive"
      }
    }
    if (wind_speed > 6 || precipitation_probability > 40) {
      return {
        activity: "Fishing",
        icon: <Fish className="h-5 w-5" />,
        level: "caution",
        message: "Marginal",
        detail: "Light wind or occasional showers – exercise caution"
      }
    }
    if (temperature > 35) {
      return {
        activity: "Fishing",
        icon: <Fish className="h-5 w-5" />,
        level: "moderate",
        message: "Heat advisory",
        detail: "Very hot – fish may be less active, stay hydrated"
      }
    }
    return {
      activity: "Fishing",
      icon: <Fish className="h-5 w-5" />,
      level: "good",
      message: "Good conditions",
      detail: "Calm weather – excellent for fishing"
    }
  }

  const getConstructionAdvice = (): WorkAdvice => {
    if (wind_speed > 12 || precipitation_probability > 80 || temperature > 38) {
      return {
        activity: "Construction / Outdoor Work",
        icon: <Construction className="h-5 w-5" />,
        level: "bad",
        message: "Stop work",
        detail: "Unsafe conditions: high wind, heavy rain, or extreme heat"
      }
    }
    if (wind_speed > 8 || precipitation_probability > 50 || temperature > 32) {
      return {
        activity: "Construction / Outdoor Work",
        icon: <Construction className="h-5 w-5" />,
        level: "caution",
        message: "Proceed with care",
        detail: "Wind or heat may cause fatigue; secure materials"
      }
    }
    if (uv_index > 7) {
      return {
        activity: "Construction / Outdoor Work",
        icon: <Construction className="h-5 w-5" />,
        level: "moderate",
        message: "UV warning",
        detail: "High UV – use sunscreen, cover skin, take shade breaks"
      }
    }
    return {
      activity: "Construction / Outdoor Work",
      icon: <Construction className="h-5 w-5" />,
      level: "good",
      message: "Safe to work",
      detail: "Weather favourable for outdoor construction"
    }
  }

  const advices = [
    getFarmingAdvice(),
    getFishingAdvice(),
    getConstructionAdvice()
  ]

  const levelColor = (level: string) => {
    switch (level) {
      case "good":
        return "text-green-800 border-green-800 bg-green-50"
      case "moderate":
        return "text-amber-800 border-amber-800 bg-amber-50"
      case "caution":
        return "text-orange-800 border-orange-800 bg-orange-50"
      case "bad":
        return "text-rose-800 border-rose-800 bg-rose-50"
      default:
        return "text-gray-800 border-gray-800 bg-gray-50 "
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle className="h-5 w-5" />
          Work Suitability
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {advices.map((advice, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 rounded-lg border p-3 ${levelColor(advice.level)}`}
          >
            {advice.icon}
            <div className="w-full flex-1">
              <p className="font-semibold">
                {advice.activity} • [{advice.message}]
              </p>
              <p className="mt-1 opacity-80">{advice.detail}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
