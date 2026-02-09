---
name: movie-app-setup
description: Configura proyectos Movie App desde cero usando Vite + React + TypeScript. Usa cuando necesites inicializar un nuevo proyecto, configurar dependencias, estructurar carpetas, o preparar el entorno de desarrollo para la aplicación de películas.
---

# Movie App - Setup del Proyecto

## Stack Tecnológico

- **Vite**: Build tool y dev server
- **React**: Framework UI
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos utilitarios
- **Framer Motion**: Animaciones
- **React Router**: Navegación
- **Axios/Fetch**: Llamadas API

## Inicialización del Proyecto

### Paso 1: Crear proyecto con Vite

```bash
npm create vite@latest movie-app -- --template react-ts
cd movie-app
npm install
```

### Paso 2: Instalar dependencias esenciales

```bash
# Estilos y diseño
npm install -D tailwindcss postcss autoprefixer
npm install framer-motion
npm install @headlessui/react @radix-ui/react-dialog @radix-ui/react-dropdown-menu

# Iconos
npm install react-icons
# o
npm install lucide-react

# Navegación
npm install react-router-dom

# Utilidades
npm install axios
npm install clsx
npm install date-fns
```

### Paso 3: Configurar Tailwind CSS

```bash
npx tailwindcss init -p
```

**tailwind.config.js:**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6",
          dark: "#2563EB",
        },
        secondary: {
          DEFAULT: "#8B5CF6",
          dark: "#7C3AED",
        },
      },
    },
  },
  plugins: [],
};
```

**src/index.css:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-slate-900 text-slate-50;
  }
}
```

## Estructura de Carpetas

```
src/
├── assets/              # Imágenes, logos, iconos
│   ├── images/
│   └── icons/
├── components/          # Componentes reutilizables
│   ├── ui/             # Botones, Cards, Inputs básicos
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── layout/         # Header, Footer, Sidebar
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── movies/         # Componentes específicos de películas
│       ├── MovieCard.tsx
│       ├── MovieGrid.tsx
│       ├── MovieDetails.tsx
│       └── MovieSearch.tsx
├── pages/              # Páginas completas
│   ├── Home.tsx
│   ├── MovieDetails.tsx
│   ├── Search.tsx
│   └── Favorites.tsx
├── hooks/              # Custom hooks
│   ├── useMovies.ts
│   ├── useFavorites.ts
│   ├── useSearch.ts
│   └── useDebounce.ts
├── services/           # Llamadas a API
│   ├── api.ts          # Configuración axios
│   ├── movies.service.ts
│   └── auth.service.ts
├── context/            # Context API
│   ├── AuthContext.tsx
│   ├── FavoritesContext.tsx
│   └── ThemeContext.tsx
├── types/              # Tipos TypeScript
│   ├── movie.types.ts
│   ├── user.types.ts
│   └── api.types.ts
├── utils/              # Funciones helper
│   ├── formatters.ts   # formatDate, formatCurrency
│   ├── validators.ts
│   └── constants.ts
├── styles/             # CSS global, configuraciones
│   └── globals.css
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

## Configuración TypeScript

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/services/*": ["./src/services/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Configuración de Rutas

**src/App.tsx:**

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { MovieDetails } from "./pages/MovieDetails";
import { Search } from "./pages/Search";
import { Favorites } from "./pages/Favorites";
import { Header } from "./components/layout/Header";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/search" element={<Search />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## Configuración de API

**src/services/api.ts:**

```tsx
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## Variables de Entorno

**.env:**

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Movie App
```

**.env.example:**

```env
VITE_API_URL=
VITE_APP_NAME=Movie App
```

## Scripts de Package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

## Checklist de Setup

Al inicializar un proyecto, verifica:

- [ ] Proyecto creado con Vite + React + TypeScript
- [ ] Tailwind CSS configurado y funcionando
- [ ] Estructura de carpetas creada
- [ ] Dependencias principales instaladas
- [ ] TypeScript configurado con paths aliases
- [ ] React Router configurado
- [ ] Servicio API base configurado
- [ ] Variables de entorno configuradas
- [ ] Scripts de desarrollo funcionando
- [ ] Estilos globales aplicados (fondo slate-900)
