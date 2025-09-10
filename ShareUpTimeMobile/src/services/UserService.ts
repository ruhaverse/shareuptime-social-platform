import apiClient from './ApiClient';

interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  bio?: string;
  profileImageUrl?: string;
}

interface UserResponse {
  success: boolean;
  message?: string;
  user?: UserProfile;
  users?: UserProfile[];
}

class UserService {
  async getProfile(userId: string): Promise<UserResponse> {
    try {
      const response = await apiClient.get<UserResponse>(`/users/${userId}`);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profil yüklenemedi',
      };
    }
  }

  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserResponse> {
    try {
      const response = await apiClient.put<UserResponse>(`/users/${userId}`, profileData);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profil güncellenemedi',
      };
    }
  }

  async followUser(userId: string): Promise<UserResponse> {
    try {
      const response = await apiClient.post<UserResponse>(`/users/${userId}/follow`);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Takip işlemi başarısız',
      };
    }
  }

  async unfollowUser(userId: string): Promise<UserResponse> {
    try {
      const response = await apiClient.delete<UserResponse>(`/users/${userId}/follow`);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Takibi bırakma başarısız',
      };
    }
  }

  async searchUsers(query: string): Promise<UserResponse> {
    try {
      const response = await apiClient.get<UserResponse>('/users/search', {
        q: query,
      });
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Kullanıcı araması başarısız',
        users: [],
      };
    }
  }
}

export const userService = new UserService();
export default userService;
