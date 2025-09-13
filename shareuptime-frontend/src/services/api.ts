import apiClient from '@/lib/api';

// Shared types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth
export interface Credentials { email: string; password: string }
export interface RegisterPayload { email: string; password: string; username: string }
export interface User { id: string; email: string; username: string; avatarUrl?: string }
export interface AuthResult { token: string; user: User }

export const AuthAPI = {
  register: (payload: RegisterPayload) => apiClient.post<AuthResult>('/auth/register', payload),
  login: (payload: Credentials) => apiClient.post<AuthResult>('/auth/login', payload),
  logout: () => apiClient.post<ApiResponse>('/auth/logout'),
  me: () => apiClient.get<User>('/auth/me'),
};

// Posts & Feed
export interface PostInput { content: string; mediaUrl?: string }
export interface Post { id: string; userId: string; content: string; mediaUrl?: string; likes: number; createdAt: string }

export const PostAPI = {
  create: (payload: PostInput) => apiClient.post<Post>('/posts', payload),
  get: (id: string) => apiClient.get<Post>(`/posts/${id}`),
  update: (id: string, payload: PostInput) => apiClient.put<Post>(`/posts/${id}`, payload),
  remove: (id: string) => apiClient.delete<ApiResponse>(`/posts/${id}`),
  like: (id: string) => apiClient.post<ApiResponse>(`/posts/${id}/like`),
  unlike: (id: string) => apiClient.delete<ApiResponse>(`/posts/${id}/like`),
  comments: {
    add: (id: string, content: string) => apiClient.post<ApiResponse>(`/posts/${id}/comments`, { content }),
    list: (id: string) => apiClient.get<any[]>(`/posts/${id}/comments`),
  },
};

export const FeedAPI = {
  list: () => apiClient.get<Post[]>('/feed'),
  trending: () => apiClient.get<Post[]>('/feed/trending'),
  explore: () => apiClient.get<Post[]>('/feed/explore'),
};

// Media
export interface UploadResult { fileUrl: string }
export const MediaAPI = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient.post<UploadResult>('/media/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  remove: (id: string) => apiClient.delete<ApiResponse>(`/media/${id}`),
};

// Notifications
export interface NotificationItem { id: string; type: string; text: string; read: boolean; createdAt: string }
export const NotificationAPI = {
  list: () => apiClient.get<NotificationItem[]>('/notifications'),
  read: (id: string) => apiClient.put<ApiResponse>(`/notifications/${id}/read`, {}),
  readAll: () => apiClient.put<ApiResponse>('/notifications/read-all', {}),
};
