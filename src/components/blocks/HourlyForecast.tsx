import { format } from "date-fns"
import { Thermometer, Eye, Wind, Droplets } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts"

import type { HourlyForecast } from "#app/types/common/weather"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../ui/card"
import { ScrollArea } from "../ui/scroll-area"

interface HourlyForecastProps {
  hourly: HourlyForecast[]
  units: "metric" | "imperial"
}

const getTempUnit = (units: "metric" | "imperial") =>
  units === "metric" ? "°C" : "°F"

export function HourlyForecast({ hourly, units }: HourlyForecastProps) {
  if (!hourly || hourly.length === 0) return null

  const next24h = hourly.slice(0, 24)

  const chartData = next24h.map((h) => ({
    time: format(new Date(h.time), "HH:mm"),
    temp: h.temperature,
    feelsLike: h.feels_like,
    uv: h.uv_index
  }))

  const tempUnit = getTempUnit(units)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hourly Forecast (Today)</CardTitle>
        <CardDescription>
          Temperature, feels‑like & UV index trend
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={3} />
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
              <Legend />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name={`Temp (${tempUnit})`}
              />
              <Line
                type="monotone"
                dataKey="feelsLike"
                stroke="#a78bfa"
                strokeWidth={2}
                dot={false}
                name={`Feels like (${tempUnit})`}
              />
              <Line
                type="monotone"
                dataKey="uv"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 2 }}
                name="UV Index"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <ScrollArea className="w-full rounded-md">
          <div className="flex space-x-4 pb-4 lg:overflow-x-auto">
            {next24h?.map((hour, idx) => (
              <div
                key={idx}
                className="bg-card w-36 shrink-0 rounded-xl border p-3 text-center"
              >
                <p className="text-sm font-semibold">
                  {format(new Date(hour?.time), "h a")}
                </p>

                <div className="my-2 flex flex-col items-center">
                  <img
                    src={hour?.icon}
                    alt="condition"
                    className="h-10 w-10 object-contain"
                  />
                  <p className="text-xl font-bold">
                    {Math.round(hour?.temperature)}°
                    {tempUnit === "°C" ? "C" : "F"}
                  </p>
                </div>

                <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3" />
                    FL {Math.round(hour?.feels_like)}°
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    UV {hour?.uv_index.toFixed(1)}
                  </span>
                </div>

                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    {Math.round(hour?.wind_speed)}{" "}
                    {units === "metric" ? "m/s" : "mph"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-blue-400" />
                    {hour?.precipitation_probability}%
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
