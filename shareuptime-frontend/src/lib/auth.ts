import apiClient from './api';
import Cookies from 'js-cookie';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    fullName: string;
  };
}

export class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      
      if (response.success && response.token) {
        Cookies.set('token', response.token, { expires: 7 });
        if (response.user) {
          Cookies.set('userId', response.user.id, { expires: 7 });
        }
      }
      
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Giriş başarısız',
      };
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Kayıt başarısız',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('token');
      Cookies.remove('userId');
    }
  }

  isAuthenticated(): boolean {
    return !!Cookies.get('token');
  }

  getCurrentUserId(): string | null {
    return Cookies.get('userId') || null;
  }
}

export const authService = new AuthService();
