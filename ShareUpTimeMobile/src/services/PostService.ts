import apiClient from './ApiClient';

interface Post {
  id: string;
  username: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  timestamp: string;
  isLiked: boolean;
}

interface CreatePostRequest {
  content: string;
  imageUrl?: string;
}

interface PostResponse {
  success: boolean;
  message?: string;
  post?: Post;
  posts?: Post[];
}

class PostService {
  async getFeed(page: number = 1, limit: number = 20): Promise<PostResponse> {
    try {
      const response = await apiClient.get<PostResponse>('/posts/feed', {
        page,
        limit,
      });
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Feed yüklenemedi',
        posts: [],
      };
    }
  }

  async createPost(postData: CreatePostRequest): Promise<PostResponse> {
    try {
      const response = await apiClient.post<PostResponse>('/posts', postData);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gönderi oluşturulamadı',
      };
    }
  }

  async likePost(postId: string): Promise<PostResponse> {
    try {
      const response = await apiClient.post<PostResponse>(`/posts/${postId}/like`);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Beğeni işlemi başarısız',
      };
    }
  }

  async unlikePost(postId: string): Promise<PostResponse> {
    try {
      const response = await apiClient.delete<PostResponse>(`/posts/${postId}/like`);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Beğeni kaldırma başarısız',
      };
    }
  }

  async getPostById(postId: string): Promise<PostResponse> {
    try {
      const response = await apiClient.get<PostResponse>(`/posts/${postId}`);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gönderi bulunamadı',
      };
    }
  }

  async deletePost(postId: string): Promise<PostResponse> {
    try {
      const response = await apiClient.delete<PostResponse>(`/posts/${postId}`);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gönderi silinemedi',
      };
    }
  }
}

export const postService = new PostService();
export default postService;
