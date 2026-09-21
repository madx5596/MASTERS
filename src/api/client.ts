const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.baseUrl = API_URL;
    this.token = localStorage.getItem('auth_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  setTokens(token: string | null, refreshToken?: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }

    if (refreshToken !== undefined) {
      this.refreshToken = refreshToken;
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      } else {
        localStorage.removeItem('refresh_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach(cb => cb(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) return null;

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        this.setTokens(data.data.token, data.data.refreshToken);
        return data.data.token;
      }

      return null;
    } catch {
      return null;
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      let response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      // If 401 and we have a refresh token, try to refresh
      if (response.status === 401 && this.refreshToken && !endpoint.includes('/auth/')) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          const newToken = await this.refreshAccessToken();
          this.isRefreshing = false;

          if (newToken) {
            this.onTokenRefreshed(newToken);
            // Retry the original request
            (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(`${this.baseUrl}${endpoint}`, {
              ...options,
              headers,
            });
          } else {
            this.clearTokens();
            return {
              success: false,
              error: { code: 'UNAUTHORIZED', message: 'Session expired. Please login again.' },
            };
          }
        } else {
          // Wait for the refresh to complete
          return new Promise((resolve) => {
            this.addRefreshSubscriber((token) => {
              (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
              fetch(`${this.baseUrl}${endpoint}`, { ...options, headers })
                .then(r => r.json())
                .then(resolve);
            });
          });
        }
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || { code: 'REQUEST_FAILED', message: 'Request failed' },
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: 'Network error. Please check your connection.' },
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
export default api;
