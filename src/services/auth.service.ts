import api from "./api";
import type {
  User,
  LoginResponse,
  RegisterResponse,
  ApiErrorResponse,
} from "@/types/user.types";

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roleId?: number;
}

/**
 * Inicia sesión con email y password
 * @returns Token JWT
 * @throws Error con mensaje si las credenciales son incorrectas
 */
export const loginUser = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    // Manejar errores del backend
    if (error.response?.data?.errors) {
      const errorData: ApiErrorResponse = error.response.data;
      const errorMessage =
        errorData.errors.map((e) => e.message).join(", ") ||
        "Credenciales incorrectas";
      throw new Error(errorMessage);
    }
    throw new Error("Error al iniciar sesión. Intenta nuevamente.");
  }
};

/**
 * Registra un nuevo usuario
 * @returns Usuario creado y token JWT
 * @throws Error con mensajes de validación si hay errores
 */
export const registerUser = async (
  data: RegisterData,
): Promise<RegisterResponse> => {
  try {
    const response = await api.post<RegisterResponse>("/auth/register", data);
    return response.data;
  } catch (error: any) {
    // Manejar errores del backend
    if (error.response?.data?.errors) {
      const errorData: ApiErrorResponse = error.response.data;
      const errorMessage =
        errorData.errors.map((e) => e.message).join(", ") ||
        "Error al registrar usuario";
      throw new Error(errorMessage);
    }
    throw new Error("Error al registrar usuario. Intenta nuevamente.");
  }
};
