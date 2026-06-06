import { useQuery } from "@tanstack/react-query"

import { fetchClient } from "#app/lib/client/fetch-client"
import type { WeatherApiResponse } from "#app/types/common/weather"

interface UseWeatherParams {
  lat: number | null
  lon: number | null
  days?: number
  ai?: boolean
  units?: "metric" | "imperial"
}

export function useWeather({
  lat,
  lon,
  days = 7,
  ai = false,
  units = "metric"
}: UseWeatherParams) {
  const enabled = lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon)

  return useQuery({
    queryKey: ["weather", lat, lon, days, ai, units],
    queryFn: async () => {
      const url = `weather/current?lat=${lat}&lon=${lon}&days=${days}&ai=${ai}&units=${units}`
      const response = await fetchClient<WeatherApiResponse>(url, {
        method: "GET"
      })
      return response.data
    },
    enabled,
    staleTime: 10 * 60 * 1000,
    retry: 1
  })
}
