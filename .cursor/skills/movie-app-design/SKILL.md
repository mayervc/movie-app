---
name: movie-app-design
description: Diseña interfaces modernas para Movie App usando Tailwind CSS, Framer Motion y componentes accesibles. Usa cuando necesites crear o mejorar componentes UI, aplicar estilos, implementar animaciones, o trabajar con diseño responsive para la aplicación de películas.
---

# Movie App - Frontend Design

## Principios de Diseño

### Paleta de Colores

**Esquema Moderno Azul:**

- Fondo principal: `#0F172A` (slate-900)
- Acento primario: `#3B82F6` (blue-500)
- Acento secundario: `#8B5CF6` (violet-500)
- Texto principal: `#F8FAFC` (slate-50)
- Texto secundario: `#94A3B8` (slate-400)

**Uso en Tailwind:**

```tsx
// Fondo
bg-slate-900

// Acentos
text-blue-500 hover:text-blue-400
bg-violet-500 hover:bg-violet-600

// Texto
text-slate-50
text-slate-400
```

### Stack Tecnológico

- **Tailwind CSS**: Estilos utilitarios, mobile-first
- **Framer Motion**: Animaciones fluidas (200-300ms)
- **Headless UI / Radix UI**: Componentes accesibles sin estilos
- **React Icons / Lucide React**: Iconos modernos

### Enfoque Responsive

**Desktop-first con adaptación mobile:**

- Diseño principal: 1920px, 1440px
- Grids: 5-6 columnas desktop → 2-3 tablet → 1-2 móvil
- Menú horizontal desktop → hamburger móvil
- Sidebar filtros visible → collapsible móvil

**Breakpoints Tailwind:**

- `sm`: 640px (móvil grande)
- `md`: 768px (tablet)
- `lg`: 1024px (laptop)
- `xl`: 1280px (desktop)
- `2xl`: 1536px (pantallas grandes)

## Componentes Base

### Movie Card

```tsx
import { motion } from "framer-motion";

const MovieCard = ({ movie }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.2 }}
    className="group relative overflow-hidden rounded-lg bg-slate-800 cursor-pointer"
  >
    <img
      src={movie.poster}
      alt={movie.title}
      className="w-full h-auto transition-transform duration-300 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-slate-50 font-semibold text-sm">{movie.title}</h3>
        <p className="text-slate-400 text-xs mt-1">{movie.year}</p>
      </div>
    </div>
  </motion.div>
);
```

### Grid Responsive

```tsx
// Desktop: 5-6 columnas, Tablet: 2-3, Móvil: 1-2
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
  {movies.map((movie) => (
    <MovieCard key={movie.id} movie={movie} />
  ))}
</div>
```

### Botones Interactivos

```tsx
// Botón primario
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
>
  Ver Detalles
</motion.button>

// Botón secundario con glass morphism
<button className="px-4 py-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg text-slate-50 hover:bg-slate-700/50 transition-all duration-200">
  Favoritos
</button>
```

## Efectos Visuales

### Hover Effects en Cards

- Escala suave: `scale(1.05)` con `duration: 0.2s`
- Brillo sutil: overlay con gradiente
- Transición de imagen: `scale(1.1)` en hover

### Skeleton Loaders

```tsx
const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="bg-slate-800 rounded-lg h-64 w-full mb-2"></div>
    <div className="bg-slate-800 rounded h-4 w-3/4 mb-2"></div>
    <div className="bg-slate-800 rounded h-4 w-1/2"></div>
  </div>
);
```

### Micro-animaciones

- Botones: `scale(1.05)` en hover, `scale(0.95)` en click
- Favoritos: rotación o pulso al agregar
- Transiciones: `duration: 200-300ms` para fluidez

### Scroll Reveal

```tsx
import { motion } from "framer-motion";

<motion.section
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
>
  {/* Contenido */}
</motion.section>;
```

## Glass Morphism

Para modals y overlays:

```tsx
<div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-6">
  {/* Contenido */}
</div>
```

## Formularios y Inputs

```tsx
// Input de búsqueda con sugerencias
<div className="relative">
  <input
    type="text"
    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
    placeholder="Buscar películas..."
  />
  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
</div>
```

## Mejores Prácticas

1. **Consistencia**: Usa siempre la paleta definida
2. **Accesibilidad**: Contraste mínimo 4.5:1, focus visible
3. **Performance**: Lazy loading de imágenes, animaciones con `will-change` cuando sea necesario
4. **Mobile-first**: Diseña primero para móvil, luego escala
5. **Transiciones**: 200-300ms para interacciones, 500ms para scroll reveal
6. **Espaciado**: Usa escala Tailwind (4, 6, 8, 12, 16, 24)

## Checklist de Diseño

Al crear un componente, verifica:

- [ ] Responsive en todos los breakpoints
- [ ] Hover states definidos
- [ ] Estados de carga (skeleton)
- [ ] Estados de error
- [ ] Accesibilidad (ARIA labels, keyboard navigation)
- [ ] Animaciones suaves (200-300ms)
- [ ] Consistencia con paleta de colores
