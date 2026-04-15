# /component

Crea un nuevo componente React siguiendo las convenciones del proyecto.

## Argumentos
`$ARGUMENTS` — nombre del componente (PascalCase) y opcionalmente su carpeta destino.
Ejemplos: `MovieCard`, `tickets/SeatPicker`, `ui/Badge`

## Convenciones del proyecto (OBLIGATORIO seguir)
- **Stack:** React 18 + TypeScript + Tailwind CSS + Framer Motion
- **Path alias:** usar `@/` en todos los imports
- **Exports:** named export (no default export)
- **Props:** interface `<Name>Props` en el mismo archivo, tipada al 100%
- **Estilos:** solo Tailwind. Fondo base `slate-900`, acentos `blue-500` / `violet-500`
- **Animaciones:** Framer Motion, duración 200–300 ms. Usar `motion.div` etc.
- **Carpeta destino:** `src/components/<subcarpeta>/` según el dominio (`movies/`, `tickets/`, `layout/`, `ui/`). Si no se indica, inferir por el nombre.

## Pasos
1. Lee los componentes existentes en `src/components/` para entender el estilo real del proyecto.
2. Si el componente consume datos del backend, revisa el servicio correspondiente en `src/services/`.
3. Crea el archivo `.tsx` con:
   - Interface de props
   - Componente funcional tipado
   - Tailwind classes coherentes con el design system
   - Framer Motion si hay interacciones o entradas animadas
4. Si aplica, crea o actualiza el barrel export `index.ts` de la subcarpeta.
5. No crear tests ni Storybook salvo que se pida explícitamente.
