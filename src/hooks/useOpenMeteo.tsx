import { useQuery } from "@tanstack/react-query"

import type {
  OpenMeteoGeocodingResponse,
  OpenMeteoGeocodingResult
} from "#app/types/common/open-meteo"

const fetchCities = async (
  searchTerm: string
): Promise<OpenMeteoGeocodingResult[] | null> => {
  if (!searchTerm.trim() || searchTerm.trim().length < 2) return null

  const url = new URL("https://geocoding-api.open-meteo.com/v1/search")
  url.searchParams.set("name", searchTerm.trim())
  url.searchParams.set("count", "5")
  url.searchParams.set("language", "en")
  url.searchParams.set("format", "json")

  try {
    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: OpenMeteoGeocodingResponse = await res.json()

    return data.results ?? null
  } catch (err) {
    console.error("Geocoding fetch error:", err)
    throw new Error("Failed to fetch city data", { cause: err })
  }
}

export function useOpenMeteo(searchTerm: string) {
  const trimmed = searchTerm.trim()
  const isEnabled = trimmed.length >= 2

  return useQuery({
    queryKey: ["citySearch", trimmed.toLowerCase()],
    queryFn: () => fetchCities(trimmed),
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
    retry: 1
  })
}
