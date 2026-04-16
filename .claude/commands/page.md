# /page

Creates a new page (route component) following project conventions.

## Arguments
`$ARGUMENTS` — page name and optionally the route path.
Examples: `ActorDetail`, `Profile /profile`

## Project conventions (REQUIRED)
- **Location:** `src/pages/<NamePage>.tsx`
- **Stack:** React 18 + TypeScript + Tailwind CSS + Framer Motion
- **Path alias:** use `@/` for all imports
- **Exports:** named export
- **Routing:** React Router v6. Read `src/App.tsx` to understand how routes are registered.
- **Layout:** authenticated pages render inside `AuthenticatedLayout` (includes `Header`). Do not reimplement the layout.
- **Data:** use `useEffect` + service from `src/services/` or a custom hook from `src/hooks/`. No direct fetch calls.
- **States:** loading skeleton + error state always present.
- **Base background:** `bg-slate-900 min-h-screen`
- **Entry animations:** `motion.div` with `initial={{ opacity: 0, y: 20 }}` and `animate={{ opacity: 1, y: 0 }}`

## Steps
1. Read `src/App.tsx` to understand the existing route structure.
2. Read similar pages in `src/pages/` to maintain visual consistency.
3. Create `src/pages/<Name>Page.tsx` with loading, error, and main content states.
4. At the end, show the snippet to add in `src/App.tsx` to register the new route.
5. Do not modify `App.tsx` automatically — only show the snippet to add.
