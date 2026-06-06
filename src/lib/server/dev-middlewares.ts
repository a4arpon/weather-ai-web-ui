import type { Context, Next } from "hono"
import { describeRoute } from "hono-openapi"
import type { OpenAPIV3 } from "openapi-types"

import { ServerENV } from "./env"

export const openApiQueryParam = (
  type: "string" | "number" | "boolean",
  name: string,
  description?: string,
  enumValues?: string[]
) => {
  return {
    in: "query",
    name: name,
    description: description,
    schema: {
      type: type,
      enum: enumValues
    }
  } as OpenAPIV3.ParameterObject
}

export const apiRouteDoc = (options: {
  tag: string
  rawSchema?: {
    [media: string]: OpenAPIV3.MediaTypeObject
  }
  summary?: string
  parameters?: OpenAPIV3.ParameterObject[]
}) =>
  ServerENV.isProduction
    ? (_: Context, next: Next) => next()
    : describeRoute({
        tags: [options.tag],
        ...(options.summary !== undefined && { summary: options.summary }),
        ...(options.parameters !== undefined && {
          parameters: options.parameters
        })
      })
