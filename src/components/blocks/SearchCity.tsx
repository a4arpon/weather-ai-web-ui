import { AlertCircle, Check, Loader2, MapPin, Trash } from "lucide-react"
import { useState } from "react"

import { useDebounce } from "#app/hooks/useDebounce"
import { useOpenMeteo } from "#app/hooks/useOpenMeteo"

import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../ui/card"
import { Input } from "../ui/input"

export const SearchCity = () => {
  const [rawSearch, setRawSearch] = useState("")
  const [selectedCity, setSelectedCity] = useState<{
    name: string
    lat: number
    lon: number
    country: string
    admin1?: string
  } | null>(null)

  const debouncedSearch = useDebounce(rawSearch, 400)
  const { data: cities, isLoading, error } = useOpenMeteo(debouncedSearch)

  const handleClear = () => {
    setRawSearch("")
    setSelectedCity(null)
    // Clear URL params
    const url = new URL(window.location.href)
    url.searchParams.delete("lat")
    url.searchParams.delete("lon")
    url.searchParams.delete("city")
    window.history.pushState({}, "", url)
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  const handleSelectCity = (city: {
    name: string
    lat: number
    lon: number
    country: string
    admin1?: string
  }) => {
    setSelectedCity(city)
    setRawSearch("")

    const url = new URL(window.location.href)
    url.searchParams.set("lat", city.lat.toString())
    url.searchParams.set("lon", city.lon.toString())
    url.searchParams.set("city", city.name)
    window.history.pushState({}, "", url)
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  const handleChangeCity = () => {
    setSelectedCity(null)
    setRawSearch("")

    document
      .querySelector<HTMLInputElement>("input[placeholder*='city']")
      ?.focus()
  }

  if (selectedCity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Selected Location</CardTitle>
          <CardDescription>
            Current city - you can change it anytime.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <div>
                <p className="font-medium">{selectedCity.name}</p>
                <p className="text-muted-foreground text-xs">
                  {selectedCity.admin1 ? `${selectedCity.admin1}, ` : ""}
                  {selectedCity.country}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleChangeCity}>
              Change City
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search City</CardTitle>
        <CardDescription>
          Type at least 2 characters - we'll find matching cities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Input
            type="text"
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            placeholder="e.g., Nairobi, Tokyo, London"
          />
          <Button
            variant="destructive"
            onClick={handleClear}
            disabled={!rawSearch}
            type="button"
          >
            <Trash className="h-4 w-4" />
            Clear
          </Button>
        </div>

        <div className="min-h-[120px]">
          {rawSearch.trim().length < 2 && rawSearch.trim().length > 0 && (
            <p className="text-muted-foreground py-4 text-center text-sm">
              Type at least 2 characters...
            </p>
          )}
          {rawSearch.trim().length === 0 && (
            <p className="text-muted-foreground py-4 text-center text-sm">
              ✨ Start typing a city name...
            </p>
          )}

          {isLoading && (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </div>
          )}

          {error && (
            <div className="text-destructive flex items-center justify-center gap-2 py-4">
              <AlertCircle className="h-4 w-4" />
              <span>Error: {error.message}</span>
            </div>
          )}

          {cities && cities.length === 0 && debouncedSearch.length >= 2 && (
            <p className="text-muted-foreground py-4 text-center text-sm">
              😕 No cities found for “{debouncedSearch}”
            </p>
          )}

          {cities && cities.length > 0 && (
            <ul className="divide-border divide-y rounded-md border">
              {cities.map((city) => (
                <li
                  key={city.id}
                  className="hover:bg-accent/10 flex cursor-pointer items-center justify-between p-3 transition-colors"
                  onClick={() =>
                    handleSelectCity({
                      name: city.name,
                      lat: city.latitude,
                      lon: city.longitude,
                      country: city.country,
                      ...(city.admin1 && { admin1: city.admin1 })
                    })
                  }
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="font-medium">{city.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {city.admin1 ? `${city.admin1}, ` : ""}
                        {city.country}
                      </p>
                    </div>
                  </div>
                  <span className="text-muted-foreground font-mono text-xs">
                    {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
