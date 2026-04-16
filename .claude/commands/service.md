# /service

Creates a new API service or adds methods to an existing one, following the project pattern.

## Arguments
`$ARGUMENTS` — module name. Examples: `users`, `actors`, `cinemas`

## Project conventions (REQUIRED)
- **Location:** `src/services/<name>.service.ts`
- **Axios instance:** always import and use `api` from `@/services/api` (already has auth and 401 interceptors)
- **Naming:** camelCase for all body fields and params — the BE uses camelCase
- **Errors:** do not swallow errors unless the endpoint returns 404 as a valid state (e.g. `getMySubscription`)
- **Types:** all functions typed with interfaces from `@/types/`. If the type does not exist, create it in `src/types/<module>.types.ts`
- **Exports:** named object `<name>Service` with methods, or named export functions — follow the pattern of the closest file in `src/services/`

## Steps
1. Read `src/services/api.ts` to understand the axios instance.
2. Read 2–3 existing services to infer the exact style.
3. Check the BE API Reference (available in CLAUDE.md or current context) for the module's endpoints.
4. If the service already exists, only add the missing methods without touching existing ones.
5. Create or update types in `src/types/` if necessary.
6. Do not create mocks or tests.
