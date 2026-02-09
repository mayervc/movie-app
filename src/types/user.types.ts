export interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roleId: number;
  phoneNumber: string | null;
  birthday: string | null;
  genres: number[];
  city: string | null;
  createdAt: string;
  updatedAt: string;
}

// Respuesta del login (solo token)
export interface LoginResponse {
  token: string;
}

// Respuesta del registro (user + token)
export interface RegisterResponse {
  user: User;
  token: string;
}

// Tipo genérico para respuestas de autenticación
export type AuthResponse = LoginResponse | RegisterResponse;

// Estructura de errores del backend
export interface ApiError {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  errors: ApiError[];
}
