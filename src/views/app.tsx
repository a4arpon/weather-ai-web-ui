import { ProjectInfo } from "#app/components/blocks/AboutTheProject"
import { CurrentWeather } from "#app/components/blocks/CurrentWeather"
import { DeveloperCard } from "#app/components/blocks/DeveloperCard"
import { ForecastGrid } from "#app/components/blocks/ForecastGrid"
import { HourlyForecast } from "#app/components/blocks/HourlyForecast"
import { SearchCity } from "#app/components/blocks/SearchCity"
import { WeatherAdvisory } from "#app/components/blocks/WeatherAdvisory"
import { WeatherLoader } from "#app/components/blocks/WeatherLoader"
import { WorkSuitability } from "#app/components/blocks/WorkSuitability"
import { useCurrentLocation } from "#app/hooks/useCurrentLocation"
import { useWeather } from "#app/hooks/useWeather"

export const MainApp = () => {
  const { location } = useCurrentLocation()

  const {
    data: weatherData,
    isLoading,
    error
  } = useWeather({
    lat: location?.lat ?? null,
    lon: location?.lon ?? null,
    days: 7,
    ai: false
  })

  return (
    <div className="container mx-auto my-20 space-y-10 px-4 lg:px-0">
      <SearchCity />
      {location && (
        <>
          {isLoading && <WeatherLoader />}
          {error && (
            <div className="text-destructive">Error: {error.message}</div>
          )}
          {weatherData && (
            <>
              <CurrentWeather data={weatherData} />
              <WeatherAdvisory current={weatherData.current} />
              <WorkSuitability
                current={weatherData.current}
                hourly={weatherData.hourly}
              />
              <HourlyForecast hourly={weatherData.hourly} units="metric" />
              <ForecastGrid daily={weatherData.daily} units="metric" />
            </>
          )}
        </>
      )}
      <ProjectInfo />
      <DeveloperCard />
    </div>
  )
}
