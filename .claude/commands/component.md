# /component

Creates a new React component following project conventions.

## Arguments
`$ARGUMENTS` — component name (PascalCase) and optionally the target subfolder.
Examples: `MovieCard`, `tickets/SeatPicker`, `ui/Badge`

## Project conventions (REQUIRED)
- **Stack:** React 18 + TypeScript + Tailwind CSS + Framer Motion
- **Path alias:** use `@/` for all imports
- **Exports:** named export (no default export)
- **Props:** `<Name>Props` interface defined in the same file, fully typed
- **Styles:** Tailwind only. Base background `slate-900`, accents `blue-500` / `violet-500`
- **Animations:** Framer Motion, 200–300 ms duration. Use `motion.div` etc.
- **Target folder:** `src/components/<subfolder>/` by domain (`movies/`, `tickets/`, `layout/`, `ui/`). Infer from name if not specified.

## Steps
1. Read existing components in `src/components/` to understand the project's real style.
2. If the component consumes backend data, check the relevant service in `src/services/`.
3. Create the `.tsx` file with:
   - Props interface
   - Typed functional component
   - Tailwind classes consistent with the design system
   - Framer Motion for interactions or animated entries
4. If applicable, create or update the subfolder's `index.ts` barrel export.
5. Do not create tests or Storybook unless explicitly requested.
