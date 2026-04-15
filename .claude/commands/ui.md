# /ui

Genera un componente UI moderno y visualmente atractivo siguiendo el design system del proyecto.

## Argumentos
`$ARGUMENTS` — descripción del componente deseado. Ejemplos:
- `tarjeta de película con poster, título, rating y botón de favorito`
- `modal de confirmación de compra con desglose de precio`
- `badge de estado de suscripción (active / cancelled / expired)`
- `skeleton loader para grid de películas`

## Design system del proyecto
- **Fondo base:** `bg-slate-900` / `bg-slate-800` / `bg-slate-700`
- **Acentos primarios:** `blue-500`, `violet-500`, gradientes `from-blue-500 to-violet-600`
- **Texto:** `text-white`, `text-slate-300`, `text-slate-400`
- **Bordes:** `border-slate-700`, `border-slate-600`
- **Hover/focus:** `hover:bg-slate-700`, rings con `blue-500`
- **Animaciones:** Framer Motion 200–300 ms. `whileHover`, `whileTap`, `AnimatePresence` para mount/unmount
- **Sombras:** `shadow-xl shadow-black/50` para cards flotantes
- **Rounded:** `rounded-xl` o `rounded-2xl` para contenedores, `rounded-lg` para elementos internos
- **Gradientes en texto:** `bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent`

## Estándares de calidad
- Accesible: atributos `aria-*` donde aplique, `role`, foco visible
- Responsive: mobile-first, breakpoints `sm:` / `md:` / `lg:`
- Dark mode ya es el default (no alternar)
- Sin imágenes hardcodeadas — recibir URLs por props

## Pasos
1. Lee componentes similares en `src/components/` para no duplicar
2. Genera el componente `.tsx` con TypeScript + Tailwind + Framer Motion
3. Incluye un ejemplo de uso comentado al final del archivo
