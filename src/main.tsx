import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import "./assets/index.css"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { LocationProvider } from "./hooks/useCurrentLocation"
import { MainApp } from "./views/app"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <MainApp />
      </LocationProvider>
    </QueryClientProvider>
  </StrictMode>
)
