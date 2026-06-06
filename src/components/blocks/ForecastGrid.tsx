import { format } from "date-fns"
import { DropletsIcon, Sunrise, SunsetIcon, WindIcon } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"

import type { DailyForecast } from "#app/types/common/weather"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../ui/card"
import { ScrollArea } from "../ui/scroll-area"

interface ForecastGridProps {
  daily: DailyForecast[]
  units: "metric" | "imperial"
}

const getTempUnit = (units: "metric" | "imperial") =>
  units === "metric" ? "°C" : "°F"

const formatTime = (isoString: string) => {
  return isoString.split("T")[1]?.slice(0, 5) || isoString
}

export function ForecastGrid({ daily, units }: ForecastGridProps) {
  if (!daily || daily.length === 0) return null

  const chartData = daily.map((day) => ({
    date: format(new Date(day.date), "EEE, MMM d"),
    high: day.temp_max,
    low: day.temp_min
  }))

  const tempUnit = getTempUnit(units)

  return (
    <Card>
      <CardHeader>
        <CardTitle>7-Day Forecast</CardTitle>
        <CardDescription>Temperature trend and daily breakdown</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{
                  value: `Temperature (${tempUnit})`,
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12 }
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px"
                }}
              />
              <Line
                type="monotone"
                dataKey="high"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
                name={`High (${tempUnit})`}
              />
              <Line
                type="monotone"
                dataKey="low"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                name={`Low (${tempUnit})`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Enhanced Forecast Tiles */}
        <ScrollArea className="w-full rounded-md whitespace-nowrap">
          <div className="flex space-x-4 pb-4 lg:overflow-x-auto">
            {daily.map((day) => (
              <div
                key={day.date}
                className="bg-card inline-flex w-44 shrink-0 flex-col items-center rounded-lg border p-3 text-center"
              >
                <p className="text-sm font-medium">
                  {format(new Date(day.date), "EEE, MMM d")}
                </p>
                <img
                  src={day.icon}
                  alt="condition"
                  className="my-1 h-10 w-10 object-contain"
                />
                <p className="text-base font-bold">
                  {Math.round(day.temp_max)}/{Math.round(day.temp_min)}
                  {tempUnit}
                </p>
                <p className="text-muted-foreground text-xs">
                  💧 {day.precipitation_probability}% rain
                </p>

                {/* Extra details row: sunrise / sunset */}
                <div className="border-border text-muted-foreground mt-2 flex w-full justify-between gap-1 border-t pt-1.5 text-[11px]">
                  <div className="flex items-center gap-0.5">
                    <Sunrise className="h-3 w-3" />
                    <span>{formatTime(day.sunrise)}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <SunsetIcon className="h-3 w-3" />
                    <span>{formatTime(day.sunset)}</span>
                  </div>
                </div>

                {/* Precipitation amount + wind max */}
                <div className="text-muted-foreground mt-1 flex w-full justify-between gap-1 text-[11px]">
                  <div className="flex items-center gap-0.5">
                    <DropletsIcon className="h-3 w-3 text-blue-400" />
                    <span>{day.precipitation_sum?.toFixed(1) || 0} mm</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <WindIcon className="h-3 w-3" />
                    <span>
                      {Math.round(day.wind_max)}{" "}
                      {units === "metric" ? "m/s" : "mph"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
