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
  firstName: string;
  lastName: string;
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
      const response: any = await apiClient.post('/auth/login', {
        email,
        password,
      });
      
      if (response.accessToken) {
        Cookies.set('token', response.accessToken, { expires: 7 });
        if (response.user) {
          Cookies.set('userId', response.user.id, { expires: 7 });
        }
        return {
          success: true,
          token: response.accessToken,
          user: response.user
        };
      }
      
      return { success: false, message: 'Login failed' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Giriş başarısız',
      };
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response: any = await apiClient.post('/auth/register', userData);
      
      if (response.accessToken) {
        Cookies.set('token', response.accessToken, { expires: 7 });
        if (response.user) {
          Cookies.set('userId', response.user.id, { expires: 7 });
        }
        return {
          success: true,
          token: response.accessToken,
          user: response.user
        };
      }
      
      return { success: false, message: 'Registration failed' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Kayıt başarısız',
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
