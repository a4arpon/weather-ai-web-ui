import { createContext, useContext, useState } from "react"

interface Location {
  name: string
  lat: number
  lon: number
  country: string
  admin1?: string
}

interface LocationContextType {
  location: Location | null
  setLocation: (location: Location | null) => void
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
)

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<Location | null>(null)

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useCurrentLocation() {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error("useCurrentLocation must be used within a LocationProvider")
  }
  return context
}
