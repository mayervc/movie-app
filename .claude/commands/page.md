# /page

Crea una nueva página (route component) siguiendo las convenciones del proyecto.

## Argumentos
`$ARGUMENTS` — nombre de la página y opcionalmente la ruta. Ejemplos: `ActorDetail`, `Profile /profile`

## Convenciones del proyecto (OBLIGATORIO seguir)
- **Ubicación:** `src/pages/<NombrePage>.tsx`
- **Stack:** React 18 + TypeScript + Tailwind CSS + Framer Motion
- **Path alias:** usar `@/` en todos los imports
- **Exports:** named export
- **Routing:** React Router v6. Revisar `src/App.tsx` para ver cómo se registran las rutas.
- **Layout:** las páginas autenticadas renderizan dentro de `AuthenticatedLayout` (que incluye `Header`). No reimplementar el layout.
- **Datos:** usar `useEffect` + servicio de `src/services/` o custom hook de `src/hooks/`. No fetch directo.
- **Estados:** loading skeleton + error state siempre presentes.
- **Fondo base:** `bg-slate-900 min-h-screen`
- **Animaciones de entrada:** `motion.div` con `initial={{ opacity: 0, y: 20 }}` y `animate={{ opacity: 1, y: 0 }}`

## Pasos
1. Lee `src/App.tsx` para entender la estructura de rutas existente.
2. Lee páginas similares en `src/pages/` para mantener consistencia visual.
3. Crea `src/pages/<Nombre>Page.tsx` con loading, error y contenido principal.
4. Indica al final qué línea agregar en `src/App.tsx` para registrar la nueva ruta.
5. No modificar `App.tsx` automáticamente — solo mostrar el snippet a agregar.
