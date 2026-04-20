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

// Respuesta del login — BE returns { access_token, user }
export interface LoginResponse {
  access_token: string;
  user: User;
}

// Respuesta del registro (solo user — BE no devuelve token en signup)
export interface RegisterResponse {
  user: User;
}

// Tipo genérico para respuestas de autenticación
export type AuthResponse = LoginResponse | RegisterResponse;

export interface UpdateProfileRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
}

// Estructura de errores del backend
export interface ApiError {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  errors: ApiError[];
}
