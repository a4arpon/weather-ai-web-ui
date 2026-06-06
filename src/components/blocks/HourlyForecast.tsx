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

        <ScrollArea className="w-full rounded-md whitespace-nowrap">
          <div className="flex space-x-3 pb-4 lg:overflow-x-auto">
            {next24h?.map((hour, idx) => (
              <div
                key={idx}
                className="bg-card inline-flex w-32 shrink-0 flex-col items-center rounded-lg border p-2 text-center"
              >
                <p className="text-xs font-medium">
                  {format(new Date(hour?.time), "HH:mm")}
                </p>
                <img
                  src={hour?.icon}
                  alt="condition"
                  className="my-1 h-8 w-8 object-contain"
                />
                <p className="text-sm font-bold">
                  {Math.round(hour?.temperature)}
                  {tempUnit}
                </p>
                <div className="text-muted-foreground mt-1 flex flex-col gap-0.5 text-[10px]">
                  <div className="flex items-center justify-center gap-1">
                    <Thermometer className="h-2.5 w-2.5" />
                    <span>
                      FL {Math.round(hour?.feels_like)}
                      {tempUnit}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="h-2.5 w-2.5" />
                    <span>UV {hour?.uv_index.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Wind className="h-2.5 w-2.5" />
                    <span>
                      {Math.round(hour?.wind_speed)}{" "}
                      {units === "metric" ? "m/s" : "mph"}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Droplets className="h-2.5 w-2.5 text-blue-400" />
                    <span>{hour?.precipitation_probability}%</span>
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
