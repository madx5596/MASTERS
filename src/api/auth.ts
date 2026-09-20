import api from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    avatar?: string;
  };
}

export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/api/auth/login', data),
  register: (data: RegisterRequest) => api.post<AuthResponse>('/api/auth/register', data),
  me: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
};
