# WCM-xR-Admin — API Layer Rules

## API file structure

```
src/apis/
  apis.index.ts       # Hono entry, plugins, route mounts, error handler
  routes/             # Hono route groups (one file per domain)
  schemas/            # Drizzle pgTable + relations
  services/           # Business logic (singleton class pattern)
```

## entrypoint (`apis.index.ts`)

```ts
export const apisEntrypoint = new Hono().basePath("apis")
// global middleware: logger, cors, secureHeaders, compress, rateLimiter
apisEntrypoint.route("/", myRoutes)     // mount each route group
apisEntrypoint.onError(errorHandler)    // catches HTTPException + BetterApiError
apisEntrypoint.notFound(() => throw new HTTPException(404, ...))
```

- Exports `{ fetch: apisEntrypoint.fetch }` as default for Nitro
- Single route mount per group, all at `"/"` (basePath set on the group itself)

## route group pattern (`routes/*.ts`)

```ts
export const myRoutes = new Hono().basePath("domain")

myRoutes.get(
  "action",
  apiRouteDoc({ tag: "Domain", requestBody?: TSchema }),
  roleGuard({ requiredRoles: ["user-admin"] }),  // optional, skip for public
  async (ctx) => {
    const rawJson = await ctx.req.json()       // parse body
    const payload = MySchema.compiler.validate(rawJson)  // TypeBox validation
    const result = await myServices.someMethod(payload)
    return ctx.json(response({ message, data: result }))
  }
)
```

- Route path relative to basePath (e.g. `"list"` → `/apis/domain/list`)
- Middleware order: `apiRouteDoc` → `roleGuard` → handler
- `roleGuard` sets `ctx.get("userId")` and `ctx.get("wpSiteId")`
- Auth routes proxy to `betterAuthServer.handler(c.req.raw)` on `/*`

## service pattern (`services/*.ts`)

```ts
class MyService {
  async getSomething(id: string) {
    const [row] = await dSql.select(...).from(Table).where(eq(Table.id, id)).limit(1)
    if (!row) throw new BadRequestError("not found")
    return row
  }
}
export const myService = new MyService()  // singleton
```

- All methods as arrow/async fns
- Throw `BadRequestError` or `UnauthorizedError` on failures
- Use `dSql` singleton for DB access (never create fresh conn)

## schema pattern (`schemas/*.ts`)

```ts
import { pgTable } from "drizzle-orm/pg-core/table"
import { uuid, text, timestamp } from "drizzle-orm/pg-core/columns"

export const MyTable = pgTable("my_table", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
})
```

- Snake_case column names in DB
- `uuid().defaultRandom().primaryKey()` for ID
- `"id"` as string key (matching pgTable column name)
- Relations in `relations.ts` using `defineRelations()`

## validation pattern (`tb-models/server/*.ts`)

```ts
import Type from "typebox"
import { TypeCompiler } from "#app/lib/server/utils"

const MySchema = Type.Object({
  name: Type.String(),
  email: Type.String({ format: "email" })
})
export const MyValidator = {
  schema: MySchema,
  compiler: new TypeCompiler(MySchema)
}
```

- Define schema, export `{ schema, compiler }` pair
- Use `compiler.validate(rawJson)` in route handler — returns `Static<typeof MySchema>`
- Never manually validate; always go through `TypeCompiler`

## response & error helpers (`lib/server/api-utils.ts`)

- `response({ isSuccess, message, data, extra })` → always returns uniform shape
- `BadRequestError(msg)` → 400
- `UnauthorizedError(msg)` → 401
- `errorHandler` catches `HTTPException`, `BetterApiError`, generic errors

## DB connection (`lib/server/db-conn.ts`)

```ts
const neonPool = new Pool({ connectionString: process.env.DATABASE_URL })
export const dSql = drizzle({ client: neonPool, relations: dRelations })
```

- Singleton — import `dSql` everywhere, never create another client

## config (`lib/server/api-config.ts`)

- `honoConf.corsConfig` — single origin from env
- `honoConf.rateLimiterConfig` — 120 req/min, IP from x-forwarded-for
- `honoConf.bodyLimitConfig` — 500KB
- `honoConf.secureHeadersConfig` — CSP, XSS, XFO, COEP, COOP
- `ServerENV` from env vars

## auth (`services/auth.services.ts`)

- `betterAuthServer` with email+password, session cache 5min, 7 day expiry
- Drizzle adapter at `auth-drizzle-adapter.ts`
- `roleGuard` middleware: checks session, verifies role (user-user/user-admin/system-admin), sets ctx vars
- Roles checked against requiredRoles array

## OpenAPI docs (`lib/server/dev-middlewares.ts`)

- `apiRouteDoc({ tag, requestBody?, parameters?, summary? })` — skipped in production
- Uses hono-openapi `describeRoute()` when not production
- Swagger UI at `/apis/docs`, JSON spec at `/apis/openapi`

## strict rules

- **NEVER** call `drizzle-kit` commands — user runs them manually
- **NEVER** modify DB schema outside `schemas/*.ts`
- **NEVER** push commits
- Always use `dSql` for DB queries — no raw SQL unless absolutely needed
- Always use `response()` for all API responses
- Always use `TypeCompiler` for request body validation
