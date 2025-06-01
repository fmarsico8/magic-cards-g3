// Configura la URL base de la API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Custom error class to include response details
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Helper function para realizar solicitudes a la API
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Headers predeterminados
  let headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set default Content-Type if not already set and not sending FormData
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Obtener el token de localStorage si está disponible (solo en cliente)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("tokens");
    if (token) {
      try {
        const tokenData = JSON.parse(token);
        if (tokenData.accessToken) {
          headers["Authorization"] = `Bearer ${tokenData.accessToken}`;
        }
      } catch (e) {
        console.error("Error al analizar los datos del usuario desde localStorage");
      }
    }
  }

  // Combina las opciones con los headers
  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Manejar errores HTTP (por ejemplo, 401 o 403)
    if (!response.ok) {
      let errorMessage = "An error occurred";
      let errorData = null;
      
      // Try to parse error response as JSON
      try {
        errorData = await response.json();
        errorMessage = errorData.error || errorData.message || `Error ${response.status}: ${response.statusText}`;
      } catch (jsonError) {
        // If not JSON, use status text
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }

      // Si el error es de autenticación (401 o 403), borrar la sesión
      if (response.status === 401 || response.status === 403) {
        // Eliminar token de localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("tokens");
        }
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    // Parsear la respuesta JSON
    const data = await response.json();
    return data as T;
  } catch (error) {
    // If it's already an ApiError, just rethrow it
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Otherwise wrap in a generic error
    console.error('API request error:', error);
    throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred');
  }
}

// Métodos convenientes para los métodos HTTP comunes
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};


