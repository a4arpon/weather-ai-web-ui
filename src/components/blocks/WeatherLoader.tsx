import { Satellite, CloudDownload, Cpu, Sparkles } from "lucide-react"
import { useEffect, useState, useRef } from "react"

import { Card, CardContent } from "../ui/card"

const loadingSteps = [
  { icon: Satellite, text: "Connecting to satellite..." },
  { icon: CloudDownload, text: "Fetching weather data..." },
  { icon: Cpu, text: "Processing through supercomputer..." },
  { icon: Sparkles, text: "Almost ready..." }
] as const

export function WeatherLoader() {
  const [step, setStep] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setStep((prev) => (prev + 1) % loadingSteps.length)
    }, 950)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const currentStep = loadingSteps[step] ?? loadingSteps[0]
  const CurrentIcon = currentStep.icon

  return (
    <Card className="border-primary/20">
      <CardContent className="flex flex-col items-center justify-center space-y-4 py-12">
        <div className="relative">
          <div className="bg-primary/20 absolute inset-0 animate-ping rounded-full" />
          <CurrentIcon className="text-primary relative h-12 w-12 animate-pulse" />
        </div>
        <p className="text-foreground text-lg font-medium">
          {currentStep.text}
        </p>
        <div className="flex gap-1">
          {loadingSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                i === step ? "bg-primary w-3" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
