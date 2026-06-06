// src/components/weather/WeatherAdvisory.tsx
import { Baby, User, Heart, AlertTriangle } from "lucide-react"

import type { CurrentWeather } from "#app/types/common/weather"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

interface Props {
  current: CurrentWeather
}

interface Advice {
  icon: React.ReactNode
  label: string
  level: "good" | "caution" | "bad"
  message: string
}

export function WeatherAdvisory({ current }: Props) {
  const { temperature, uv_index, wind_speed } = current

  const getAdviceForGroup = (group: "child" | "adult" | "elderly"): Advice => {
    // Temperature checks
    if (temperature > 35) {
      return {
        icon:
          group === "child" ? (
            <Baby />
          ) : group === "adult" ? (
            <User />
          ) : (
            <Heart />
          ),
        label:
          group === "child"
            ? "Children"
            : group === "adult"
              ? "Adults"
              : "Elderly",
        level: "bad",
        message:
          group === "elderly"
            ? "Extreme heat - stay indoors"
            : "Too hot for extended outdoor activity"
      }
    }
    if (temperature < 10) {
      return {
        icon:
          group === "child" ? (
            <Baby />
          ) : group === "adult" ? (
            <User />
          ) : (
            <Heart />
          ),
        label:
          group === "child"
            ? "Children"
            : group === "adult"
              ? "Adults"
              : "Elderly",
        level: "bad",
        message:
          group === "elderly"
            ? "Cold risk - keep warm indoors"
            : "Very cold - dress warmly"
      }
    }
    // UV check
    if (uv_index > 7) {
      return {
        icon:
          group === "child" ? (
            <Baby />
          ) : group === "adult" ? (
            <User />
          ) : (
            <Heart />
          ),
        label:
          group === "child"
            ? "Children"
            : group === "adult"
              ? "Adults"
              : "Elderly",
        level: "caution",
        message: "High UV - use sunscreen, avoid midday sun"
      }
    }
    // Wind check
    if (wind_speed > 10) {
      return {
        icon:
          group === "child" ? (
            <Baby />
          ) : group === "adult" ? (
            <User />
          ) : (
            <Heart />
          ),
        label:
          group === "child"
            ? "Children"
            : group === "adult"
              ? "Adults"
              : "Elderly",
        level: "caution",
        message:
          group === "elderly"
            ? "Strong wind - risk of falls"
            : "Windy - secure loose items"
      }
    }

    // Default good
    return {
      icon:
        group === "child" ? <Baby /> : group === "adult" ? <User /> : <Heart />,
      label:
        group === "child"
          ? "Children"
          : group === "adult"
            ? "Adults"
            : "Elderly",
      level: "good",
      message: "Weather is suitable for normal activities"
    }
  }

  const childAdvice = getAdviceForGroup("child")
  const adultAdvice = getAdviceForGroup("adult")
  const elderlyAdvice = getAdviceForGroup("elderly")

  const levelColor = (level: string) => {
    switch (level) {
      case "good":
        return "text-emerald-800 border-emerald-800 bg-green-50"
      case "moderate":
        return "text-amber-800 border-amber-800 bg-amber-50"
      case "caution":
        return "text-orange-800 border-orange-800 bg-orange-50"
      case "bad":
        return "text-rose-800 border-rose-800 bg-rose-50"
      default:
        return "text-gray-800 border-gray-800 bg-gray-50"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5" />
          Weather Suitability by Age
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div
          className={`flex items-start gap-2 rounded-lg border p-3 ${levelColor(childAdvice?.level)}`}
        >
          {childAdvice?.icon}
          <div>
            <p className="text-sm font-semibold">{childAdvice?.label}</p>
            <p className="text-xs">{childAdvice?.message}</p>
          </div>
        </div>
        <div
          className={`flex items-start gap-2 rounded-lg border p-3 ${levelColor(adultAdvice?.level)}`}
        >
          {adultAdvice?.icon}
          <div>
            <p className="text-sm font-semibold">{adultAdvice?.label}</p>
            <p className="text-xs">{adultAdvice?.message}</p>
          </div>
        </div>
        <div
          className={`flex items-start gap-2 rounded-lg border p-3 ${levelColor(elderlyAdvice?.level)}`}
        >
          {elderlyAdvice?.icon}
          <div>
            <p className="text-sm font-semibold">{elderlyAdvice?.label}</p>
            <p className="text-xs">{elderlyAdvice?.message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
