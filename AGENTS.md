# WCM-xR-Admin — Agent Guide

## stack

React 19, Vite 8, TS 6, Tailwind 4, @base-ui/react, TanStack Router + Query, Hono+Nitro (serverless), Drizzle ORM + Neon/Postgres, better-auth, TypeBox validation

## path alias

`#app/*` → `./src/*` (tsconfig paths, vite resolve tsconfigPaths)

## commands

```bash
npm run dev              # vite dev (port 5173)
npm run build            # tsc -b && vite build
npm run lint             # oxfmt && oxlint (no semis, trailingComma:none, sortImports, sortTailwindcss)
npm run drizzle:gen      # node --env-file=.env.local drizzle-kit generate
npm run drizzle:push     # node --env-file=.env.local drizzle-kit push
npm run drizzle:studio   # node --env-file=.env.local drizzle-kit studio
```

Drizzle commands need `.env.local` loaded via `--env-file`. Schema source: `src/apis/schemas/*`.

No test framework, no pre-commit hooks.

## src/ layout

```
src/
  apis/           # Hono API (entry: apis.index.ts, basePath: "/apis")
    routes/       # route groups (agency, auth, orders, site-integrations, wcm-products)
    schemas/      # Drizzle pgTable defs
    services/     # business logic (auth, wocom-rest, wp-sites)
  components/
    blocks/       # layout blocks (Admin-Actionbar, Admin-Sidebar, integrations/)
    ui/           # @base-ui/react based components (Button, Card, Dialog, Table, Sidebar, etc.)
  config/         # app config + sidebar-items
  hooks/          # custom hooks (useAdminOrders, useMobile)
  lib/
    server/       # api-utils, api-config, db-conn, env, dev-middlewares, utils
    client/       # auth client, fetch-client, utils (cn)
  tb-models/      # TypeBox schemas (server/, common/)
  types/          # TS types (client/, common/)
  routes/         # TanStack Router file-based routes (__root, index, app/*, auth/)
```

## code style rules

- NO semicolons, trailing commas disabled
- oxlint + oxfmt for lint/format (no ESLint)
- Imports sorted automatically, Tailwind classes sorted automatically
- `"use client"` directive in interactive FE components
- `cn()` util for conditional class merging (clsx + tailwind-merge)
- NO inline styles, NO custom CSS injection — only Tailwind via `cn()` + `cva()`
- Design tokens from `src/assets/index.css` (oklch colors, theme inline)
- `verbatimModuleSyntax: true` in tsconfig (must use `import type` for types)

## type system & validation

- **TypeBox** for runtime validation schemas (`src/tb-models/`)
- `TypeCompiler` class (`src/lib/server/utils.ts`) wraps Compile/Check/Clean/Value.Errors
- Pattern: define `Type.Object(...)`, export `{ schema, compiler: new TypeCompiler(schema) }`
- Validation: `compiler.validate(rawJson)` → throws `BadRequestError` or returns clean `Static<T>`
- DB schemas: Drizzle `pgTable` with `uuid().defaultRandom().primaryKey()`, snake_case column names
- API response shape: `response({ isSuccess, message, data, extra })` → always `{isSuccess, message, data, extra}`
- Error classes: `BadRequestError` (400), `UnauthorizedError` (401) extend `better-auth`'s `APIError`
- Error handler catches `HTTPException` + `BetterApiError` + generic, logs to console

## key architectural rules

- API: route → middleware (optional roleGuard) → handler → service → schema
- Service classes are singletons (class with instance exported)
- DB connection: `dSql` singleton from `drizzle({ client: neonPool, relations })`
- Auth: better-auth via `betterAuthServer` with Drizzle adapter, `roleGuard` middleware for RBAC
- OpenAPI docs via `hono-openapi` `describeRoute()` / `apiRouteDoc()` (skipped in production)
- Rate limit: 120 req/min per IP, body limit 500KB, CORS single origin

## git ops (when told to commit)

- `git add` changed files, write conventional commit msg
- **DO NOT push**, DO NOT force push, DO NOT amend
- Commit msg format: `type(scope): summary` (conventional commits)

## strict never-ops

- **NEVER** run drizzle migrations (`drizzle:push`, `drizzle:migrate`, `drizzle:gen`)
- **NEVER** run schema generation commands
- **NEVER** push commits
- DB CLI ops are manual only

## deep links

- API rules: see `AGENTS-apis.md`
- Frontend rules: see `AGENTS-frontend.md`

## loaded skills

- `caveman` — ultra-compressed communication (used by default)
- `ui-ux-pro-max` — UI/UX design intelligence
