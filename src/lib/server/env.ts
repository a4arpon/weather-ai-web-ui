export const ServerENV = {
  isProduction: process.env.PROD,
  APP_URL: process.env.VITE_APP_URL as string,

  REDIS_URL: process.env.REDIS_URL as string,

  // App Specific
  WEATHER_AI_KEY: process.env.WEATHER_AI_KEY as string
}
