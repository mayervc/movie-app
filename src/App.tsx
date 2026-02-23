import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { Header } from "@/components/layout/Header";
import { Home } from "@/pages/Home";
import { MovieDetails } from "@/pages/MovieDetails";
import { Favorites } from "@/pages/Favorites";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { TicketPurchase } from "@/pages/TicketPurchase";
import { TicketPurchaseSuccess } from "@/pages/TicketPurchaseSuccess";
import { TicketPurchaseCancel } from "@/pages/TicketPurchaseCancel";
import { Plans } from "@/pages/Plans";
import { SubscriptionSuccess } from "@/pages/SubscriptionSuccess";
import { SubscriptionCancel } from "@/pages/SubscriptionCancel";

// Componente para rutas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para ruta de login (redirige si ya está autenticado)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Layout con Header para páginas autenticadas
const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas - Login y Register */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Home />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/movie/:id"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <MovieDetails />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Favorites />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/movie/:id/tickets"
        element={
          <ProtectedRoute>
            <TicketPurchase />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movie/:id/tickets/success"
        element={
          <ProtectedRoute>
            <TicketPurchaseSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movie/:id/tickets/cancel"
        element={
          <ProtectedRoute>
            <TicketPurchaseCancel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/plans"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Plans />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription/success"
        element={
          <ProtectedRoute>
            <SubscriptionSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription/cancel"
        element={
          <ProtectedRoute>
            <SubscriptionCancel />
          </ProtectedRoute>
        }
      />

      {/* Redirigir rutas no encontradas al home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </FavoritesProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;
