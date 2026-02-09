import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { loginUser, registerUser, type RegisterData } from "@/services/auth.service";
import type { User } from "@/types/user.types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        // Si hay error al parsear, limpiar localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser(email, password);
      
      // Guardar token
      localStorage.setItem("token", response.token);
      
      // El login solo devuelve el token, no el usuario completo
      // Podríamos hacer una llamada adicional para obtener el usuario si es necesario
      // Por ahora, creamos un objeto usuario básico con el email
      const basicUser: User = {
        id: 0, // Se actualizará cuando obtengamos el usuario completo
        email,
        firstName: null,
        lastName: null,
        roleId: 2, // Rol por defecto (client)
        phoneNumber: null,
        birthday: null,
        genres: [],
        city: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem("user", JSON.stringify(basicUser));
      setUser(basicUser);
    } catch (error) {
      // El error ya viene formateado desde el servicio
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await registerUser(data);
      
      // Guardar token y usuario
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      setUser(response.user);
    } catch (error) {
      // El error ya viene formateado desde el servicio
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
