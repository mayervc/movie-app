# /ui

Generates a modern, visually attractive UI component following the project's design system.

## Arguments
`$ARGUMENTS` — description of the desired component. Examples:
- `movie card with poster, title, rating and favorite button`
- `purchase confirmation modal with price breakdown`
- `subscription status badge (active / cancelled / expired)`
- `skeleton loader for movie grid`

## Project design system
- **Base background:** `bg-slate-900` / `bg-slate-800` / `bg-slate-700`
- **Primary accents:** `blue-500`, `violet-500`, gradients `from-blue-500 to-violet-600`
- **Text:** `text-white`, `text-slate-300`, `text-slate-400`
- **Borders:** `border-slate-700`, `border-slate-600`
- **Hover/focus:** `hover:bg-slate-700`, rings with `blue-500`
- **Animations:** Framer Motion 200–300 ms. `whileHover`, `whileTap`, `AnimatePresence` for mount/unmount
- **Shadows:** `shadow-xl shadow-black/50` for floating cards
- **Rounded:** `rounded-xl` or `rounded-2xl` for containers, `rounded-lg` for inner elements
- **Text gradients:** `bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent`

## Quality standards
- Accessible: `aria-*` attributes where applicable, `role`, visible focus
- Responsive: mobile-first, breakpoints `sm:` / `md:` / `lg:`
- Dark mode is the default (no toggling)
- No hardcoded images — receive URLs via props

## Steps
1. Read similar components in `src/components/` to avoid duplication
2. Generate the `.tsx` component with TypeScript + Tailwind + Framer Motion
3. Include a commented usage example at the end of the file
