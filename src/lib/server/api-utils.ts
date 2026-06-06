import type { Context } from "hono"
import { HTTPException } from "hono/http-exception"

export function response(resp: {
  isSuccess?: boolean
  message?: string
  data?: object | [] | null | undefined
  extra?: object | null
}) {
  return {
    isSuccess: resp.isSuccess ?? true,
    message: resp.message ?? "ok",
    extra: resp.extra ?? null,
    data: resp.data ?? null
  }
}

export class BadRequestError extends HTTPException {
  constructor(message: string) {
    super(400, {
      message: message
    })
  }
}

export function errorHandler(error: Error | HTTPException, ctx: Context) {
  if (error instanceof HTTPException) {
    ctx.status(error.status)
    return ctx.json(
      response({
        isSuccess: false,
        message: error.message,
        data: error
      })
    )
  }

  console.error("Application Error Log :", error)

  ctx.status(500)

  return ctx.json(
    response({
      isSuccess: false,
      message: "Internal Server Error",
      data: null,
      extra: {
        route: ctx.req.url,
        method: ctx.req.method,
        error: error
      }
    })
  )
}
