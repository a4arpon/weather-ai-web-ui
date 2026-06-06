import { format, isToday } from "date-fns"
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

import { cn } from "#app/lib/client/utils"
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
                className={cn(
                  "group relative inline-flex w-48 shrink-0 flex-col items-center rounded-xl border p-4 text-center",
                  isToday(day.date)
                    ? "border-primary bg-primary/5"
                    : "bg-card border-border"
                )}
              >
                {/* Date */}
                <p className="text-foreground text-sm font-semibold">
                  {format(new Date(day.date), "EEE, MMM d")}
                  {isToday(day.date) && (
                    <span className="bg-primary text-primary-foreground ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                      Today
                    </span>
                  )}
                </p>

                {/* Icon + Temperature row */}
                <div className="my-2 flex items-center justify-center gap-2">
                  <img
                    src={day.icon}
                    alt="condition"
                    className="h-12 w-12 object-contain"
                  />
                  <div className="text-left">
                    <p className="text-lg leading-tight font-bold">
                      {Math.round(day.temp_max)}° / {Math.round(day.temp_min)}°
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {tempUnit === "°C" ? "Celsius" : "Fahrenheit"}
                    </p>
                  </div>
                </div>

                {/* Rain chance */}
                <p className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
                  <span className="text-base">💧</span>{" "}
                  {day.precipitation_probability}% rain
                </p>

                {/* Divider */}
                <div className="bg-border my-2 h-px w-full" />

                {/* Sunrise / Sunset */}
                <div className="text-muted-foreground mb-1 flex w-full justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Sunrise className="h-3.5 w-3.5" />{" "}
                    {formatTime(day.sunrise)}
                  </span>
                  <span className="flex items-center gap-1">
                    <SunsetIcon className="h-3.5 w-3.5" />{" "}
                    {formatTime(day.sunset)}
                  </span>
                </div>

                {/* Rain amount + Wind max */}
                <div className="text-muted-foreground flex w-full justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <DropletsIcon className="h-3.5 w-3.5 text-blue-400" />{" "}
                    {day.precipitation_sum?.toFixed(1) || 0} mm
                  </span>
                  <span className="flex items-center gap-1">
                    <WindIcon className="h-3.5 w-3.5" />{" "}
                    {Math.round(day.wind_max)}{" "}
                    {units === "metric" ? "m/s" : "mph"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
