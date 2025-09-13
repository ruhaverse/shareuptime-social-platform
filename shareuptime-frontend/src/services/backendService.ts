import apiClient from '../lib/api';

export interface BackendConfig {
  apiUrl: string;
  fileStorageUrl: string;
  environment: 'development' | 'staging' | 'production';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class BackendService {
  private config: BackendConfig;

  constructor() {
    this.config = {
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      fileStorageUrl: process.env.NEXT_PUBLIC_FILE_STORAGE_URL || 'https://shareupdigitalspace.fra1.digitaloceanspaces.com',
      environment: (process.env.NEXT_PUBLIC_APP_ENV as any) || 'development'
    };
  }

  /**
   * Get backend configuration
   */
  getConfig(): BackendConfig {
    return this.config;
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get<{ status: string }>('/health');
      return response.status === 'ok';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get API version info
   */
  async getApiVersion(): Promise<string | null> {
    try {
      const response = await apiClient.get<{ version: string }>('/version');
      return response.version;
    } catch (error) {
      return null;
    }
  }

  /**
   * Upload file to storage
   */
  async uploadFile(file: File, folder: string = 'uploads'): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await apiClient.post<{ fileUrl: string }>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.fileUrl;
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      await apiClient.delete('/upload', {
        data: { fileUrl }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file URL with proper CDN/storage prefix
   */
  getFileUrl(relativePath: string): string {
    if (relativePath.startsWith('http')) {
      return relativePath;
    }
    return `${this.config.fileStorageUrl}/${relativePath}`;
  }

  /**
   * Batch API requests
   */
  async batchRequest<T>(requests: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    endpoint: string;
    data?: any;
  }>): Promise<ApiResponse<T>[]> {
    try {
      const response = await apiClient.post<{ results: ApiResponse<T>[] }>('/batch', {
        requests
      });
      return response.results;
    } catch (error) {
      return requests.map(() => ({
        success: false,
        error: 'Batch request failed'
      }));
    }
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<{
    totalUsers: number;
    totalPosts: number;
    totalShares: number;
    totalSwaps: number;
    activeUsers: number;
  } | null> {
    try {
      const response = await apiClient.get<{
        totalUsers: number;
        totalPosts: number;
        totalShares: number;
        totalSwaps: number;
        activeUsers: number;
      }>('/stats/system');
      return response;
    } catch (error) {
      return null;
    }
  }
}

export const backendService = new BackendService();
