# WCM-xR-Admin — Frontend Rules

## route pattern (`src/routes/`)

File-based TanStack Router with auto-code-splitting (`autoCodeSplitting: true`).

```
src/routes/
  __root.tsx            # Root layout (QueryClientProvider + Outlet + Toast)
  index.lazy.tsx        # Landing page
  auth/                 # Auth pages
  app/
    route.tsx           # Dashboard layout (sidebar + actionbar + Outlet)
    index.lazy.tsx      # Dashboard home
    orders.index.lazy.tsx   # Orders list
    orders.$id.lazy.tsx     # Order detail
    integrations.lazy.tsx   # Integrations page
```

Route declaration:

```ts
// Static route with no params
export const Route = createLazyFileRoute("/app/orders/")({ component: RouteComponent })
// Dynamic route with param
export const Route = createLazyFileRoute("/app/orders/$id")({ component: RouteComponent })
// With layout/loader
export const Route = createFileRoute("/app")({ component: RouteComponent, head: () => ({ meta: [...] }) })
```

- Use `createLazyFileRoute` for lazy routes, `createFileRoute` for layout routes
- Param access: `const { id } = Route.useParams()`

## ActionBar pattern

Context-based action bar in `Admin-Actionbar.tsx`.

Usage in route components:

```ts
function RouteComponent() {
  const { resetActionBar, updateTitle, updateIcon } = useActionBar()

  useLayoutEffect(() => {
    updateTitle("Page Title")
    updateIcon(SomeLucideIcon)
    return () => resetActionBar() // cleanup on unmount
  }, [resetActionBar, updateTitle, updateIcon])

  // ... JSX
}
```

- Always use `useLayoutEffect` (synchronous update before paint)
- Always call `resetActionBar()` in cleanup
- ActionBar wraps the main content via `ActionBarProvider` in `app/route.tsx`

## class naming & styling

- **NO inline styles** (`style={{}}`) — ever
- **NO custom CSS injection** — no `styled-components`, no CSS modules, no `cls` files
- Only Tailwind utility classes via `cn()` from `#app/lib/client/utils`
- Component variants via `cva()` from `class-variance-authority`
- Tailwind classes auto-sorted by oxfmt

```ts
import { cn } from "#app/lib/client/utils"
import { cva, type VariantProps } from "class-variance-authority"

export const myVariants = cva("base-classes", {
  variants: {
    variant: { primary: "...", secondary: "..." },
    size: { sm: "...", lg: "..." }
  },
  defaultVariants: { variant: "primary", size: "md" }
})

// In component:
<div className={cn(myVariants({ variant, size }), className)} />
```

## UI components (`src/components/ui/`)

All built on `@base-ui/react` primitives. Import from `#app/components/ui/*`.

Available: `button`, `card`, `dialog`, `sidebar`, `table`, `badge`, `chip`, `field`, `input`, `input-group`, `label`, `select`, `textarea`, `toast`.

Component rules:

- Always use `data-slot="component-name"` attribute on root element
- Pass `className` last in `cn()` for consumer overrides
- Use `focus-visible:outline-2` for keyboard accessibility
- Use `ring` + `inset-shadow` for depth (Tailwind 4 shadow syntax)

Example card:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>Actions</CardFooter>
</Card>
```

Example dialog:

```tsx
<Dialog>
  <DialogTrigger>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogPopup>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <DialogBody>Content</DialogBody>
    <DialogFooter>
      <DialogClose>
        <Button>Close</Button>
      </DialogClose>
    </DialogFooter>
  </DialogPopup>
</Dialog>
```

Example table:

```tsx
<TableContainer>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Col</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Data</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</TableContainer>
```

## sidebar config (`src/config/sidebar-items.tsx`)

```ts
export type AppNavigationItem = {
  icon: LucideIcon
  name: string
  route: string
  disabled?: boolean
  mobileDock?: boolean
  mobileLabel?: string
}
```

- Groups defined as array of `{ group, baseRoute, items: AppNavigationItem[] }`
- Each item maps to a route path
- `flatSidebarItems` and `mobileDockItems` derived for navigation

## data fetching

- TanStack Query for server state
- `fetchClient<T>(path, { method, reqBody? })` wrapper returns `ApiResponse<T>`
- `ApiResponse<T>` = `{ isSuccess: boolean, message: string, data: T }`

Hook pattern:

```ts
export const useMyData = () => {
  const query = useQuery({
    queryKey: ["my-data"],
    queryFn: async () => {
      const { data } = await fetchClient<MyType>("endpoint", { method: "GET" })
      return data
    }
  })
  return { data: { data: query.data, isLoading: query.isLoading } }
}
```

## auth client (`lib/client/auth.ts`)

```ts
import { createAuthClient } from "better-auth/react"
export const betterAuthClient = createAuthClient({
  apiUrl: import.meta.env.VITE_APP_URL,
  basePath: "apis/auth"
})
```

- Session check in `app/route.tsx`: `betterAuthClient.useSession()` → redirect if null

## design tokens

All in `src/assets/index.css`:

- Colors as oklch, mapped via `@theme inline { --color-*: var(--*) }`
- Radius via `--radius*` vars
- Custom `@utility` for spinner, chevron bg images
- `@utility app-container` → `@apply container mx-auto`
- Body font: Outfit (Google Fonts)
