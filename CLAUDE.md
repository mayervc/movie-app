# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # TypeScript check + production build
npm run lint      # ESLint (zero warnings allowed)
npm run preview   # Preview production build
```

No test suite is configured.

## Environment

Copy `.env.example` and set:
- `VITE_API_URL` — backend API base URL (default: `http://localhost:5001`)
- `VITE_APP_NAME` — app display name

## Architecture

**Stack:** React 18 + TypeScript + Vite, Tailwind CSS, React Router v6, Axios, Framer Motion, React PDF.

**Entry point:** `src/main.tsx` → `src/App.tsx` (routing + layout).

### Routing (`src/App.tsx`)

Two route guard wrappers:
- `ProtectedRoute` — redirects unauthenticated users to `/login`
- `PublicRoute` — redirects authenticated users to `/`

Protected pages render inside `AuthenticatedLayout` (adds the `Header`). Catch-all redirects to `/`.

### State Management (`src/context/`)

Three React Context providers wrap the app:
- **AuthContext** — login/register/logout, persists token + user to `localStorage` (`"token"`, `"user"`)
- **SubscriptionContext** — active subscription state
- **FavoritesContext** — user's favorite movies list

### API Layer (`src/services/`)

`api.ts` creates an Axios instance pointed at `VITE_API_URL`. Two interceptors:
1. **Request** — injects `Authorization: Bearer <token>` header
2. **Response** — on 401, clears `localStorage` and redirects to `/login`

Service modules (`movies.service.ts`, `auth.service.ts`, `subscriptions.service.ts`, `payments.service.ts`, `tickets.service.ts`, `orders.service.ts`) call this instance. Components consume services directly via hooks or `useEffect`.

### Directory Conventions

| Path | Purpose |
|------|---------|
| `src/pages/` | Full-page route components |
| `src/components/` | Reusable UI; sub-folders by domain (`movies/`, `tickets/`, `layout/`, `ui/`) |
| `src/hooks/` | Custom hooks (`useDebounce`, `useSearch`, `useTicketPurchase`) |
| `src/types/` | TypeScript interfaces shared across the app |
| `src/utils/` | Pure helper functions |

Path alias `@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.json`).

## Styling Conventions

- Background: `slate-900`
- Primary accents: `blue-500` / `violet-500`
- Animations: 200–300 ms via Framer Motion

## Validation Rules

- Password: minimum 6 characters, at least 1 lowercase, 1 uppercase, 1 special character
