import type { ApiResponse } from "#app/types/client/api"

interface FetchOptions extends RequestInit {
  reqBody?: unknown
  errorMessage?: string
  method?: "GET" | "POST"
}

export async function fetchClient<T = unknown>(
  path: string,
  options: FetchOptions
): Promise<ApiResponse<T>> {
  const { errorMessage, reqBody, ...fetchOptions } = options

  const reqPayload = reqBody ? JSON.stringify(reqBody) : null

  const baseUrl = import.meta.env.VITE_APP_URL

  if (!baseUrl) {
    throw new Error("VITE_APP_URL is not defined")
  }

  const response = await fetch(`${baseUrl}/apis/${path}`, {
    ...fetchOptions,
    ...(reqPayload !== null && { body: reqPayload }),
    headers: {
      "Content-Type": "application/json"
    }
  })

  const resData = await response.json()

  if (!response.ok) {
    const message =
      errorMessage ||
      (resData?.message ??
        resData?.error ??
        `Request failed with status ${response.status}`)

    throw new Error(message)
  }

  return resData as ApiResponse<T>
}
