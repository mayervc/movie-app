# /service

Crea un nuevo servicio API o agrega métodos a uno existente, siguiendo el patrón del proyecto.

## Argumentos
`$ARGUMENTS` — nombre del módulo. Ejemplos: `users`, `actors`, `cinemas`

## Convenciones del proyecto (OBLIGATORIO seguir)
- **Ubicación:** `src/services/<nombre>.service.ts`
- **Instancia axios:** importar y usar siempre `api` de `@/services/api` (ya tiene interceptores de auth y 401)
- **Naming:** camelCase en todos los campos de body y params — el BE usa camelCase
- **Errores:** no swallowear errores salvo que el endpoint devuelva 404 como estado válido (ej: `getMySubscription`)
- **Tipos:** todas las funciones tipadas con interfaces de `@/types/`. Si el tipo no existe, crearlo en `src/types/<modulo>.types.ts`
- **Exports:** objeto nombrado `<nombre>Service` con métodos, o funciones named export — seguir el patrón del archivo más cercano en `src/services/`

## Pasos
1. Lee `src/services/api.ts` para entender la instancia axios.
2. Lee 2–3 servicios existentes para inferir el estilo exacto.
3. Consulta el API Reference del BE (disponible en CLAUDE.md o el contexto actual) para los endpoints del módulo.
4. Si el servicio ya existe, agrega solo los métodos faltantes sin tocar los existentes.
5. Crea o actualiza los tipos en `src/types/` si es necesario.
6. No crear mocks ni tests.
