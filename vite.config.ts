import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },

  plugins: [
    nitro({
      preset: "netlify",

      serverEntry: {
        handler: "src/apis/apis.index.ts",
        format: "web"
      }
    }),
    tailwindcss(),
    react()
  ],
  server: {
    host: "127.0.0.1",
    port: 5173,
    forwardConsole: {
      logLevels: ["log"]
    }
  },

  clearScreen: true
})
