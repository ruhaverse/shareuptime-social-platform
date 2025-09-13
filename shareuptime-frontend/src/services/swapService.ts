import apiClient from '../lib/api';

export interface SwapChallenge {
  id: string;
  userId: string;
  originalImage: string;
  caption: string;
  location?: string;
  timeLimit: number; // hours
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
}

export interface SwapResponse {
  id: string;
  challengeId: string;
  userId: string;
  responseImage: string;
  caption?: string;
  submittedAt: string;
  votes: number;
  isWinner?: boolean;
}

export interface SwapCreateData {
  originalImage: File;
  caption: string;
  location?: string;
  timeLimit: number;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
}

export interface SwapStats {
  totalChallenges: number;
  activeChallenges: number;
  totalResponses: number;
  userRanking: number;
  winRate: number;
  popularCategories: Array<{
    category: string;
    count: number;
  }>;
}

class SwapService {
  /**
   * Create a new swap challenge
   */
  async createSwapChallenge(swapData: SwapCreateData): Promise<{ success: boolean; challengeId?: string; message?: string }> {
    try {
      const formData = new FormData();
      formData.append('originalImage', swapData.originalImage);
      formData.append('caption', swapData.caption);
      formData.append('timeLimit', swapData.timeLimit.toString());
      
      if (swapData.location) formData.append('location', swapData.location);
      if (swapData.tags) formData.append('tags', JSON.stringify(swapData.tags));
      if (swapData.difficulty) formData.append('difficulty', swapData.difficulty);
      if (swapData.category) formData.append('category', swapData.category);
      
      formData.append('createdAt', new Date().toISOString());

      const response = await apiClient.post('/api/swaps/challenges', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }) as { data: { challengeId: string } };

      return {
        success: true,
        challengeId: response.data.challengeId,
        message: 'Swap challenge created successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Submit a response to a swap challenge
   */
  async submitSwapResponse(challengeId: string, responseImage: File, caption?: string): Promise<{ success: boolean; responseId?: string; message?: string }> {
    try {
      const formData = new FormData();
      formData.append('challengeId', challengeId);
      formData.append('responseImage', responseImage);
      formData.append('submittedAt', new Date().toISOString());
      
      if (caption) formData.append('caption', caption);

      const response = await apiClient.post('/api/swaps/responses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }) as { data: { responseId: string } };

      return {
        success: true,
        responseId: response.data.responseId,
        message: 'Swap response submitted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get active swap challenges
   */
  async getActiveChallenges(page = 1, limit = 20, filters?: {
    category?: string;
    difficulty?: string;
    location?: string;
    tags?: string[];
  }): Promise<SwapChallenge[]> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: 'active'
      });

      if (filters?.category) params.append('category', filters.category);
      if (filters?.difficulty) params.append('difficulty', filters.difficulty);
      if (filters?.location) params.append('location', filters.location);
      if (filters?.tags) params.append('tags', filters.tags.join(','));

      const response = await apiClient.get(`/api/swaps/challenges?${params}`) as { data: { challenges: SwapChallenge[] } };
      return response.data.challenges || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get swap challenge details with responses
   */
  async getChallengeDetails(challengeId: string): Promise<{
    challenge: SwapChallenge | null;
    responses: SwapResponse[];
    userResponse?: SwapResponse;
  }> {
    try {
      const response = await apiClient.get(`/api/swaps/challenges/${challengeId}`) as { data: { challenge: SwapChallenge; responses: SwapResponse[]; userResponse?: SwapResponse } };
      return {
        challenge: response.data.challenge,
        responses: response.data.responses || [],
        userResponse: response.data.userResponse
      };
    } catch (error) {
      return {
        challenge: null,
        responses: [],
        userResponse: undefined
      };
    }
  }

  /**
   * Vote for a swap response
   */
  async voteForResponse(responseId: string, voteType: 'up' | 'down'): Promise<boolean> {
    try {
      await apiClient.post(`/api/swaps/responses/${responseId}/vote`, {
        voteType,
        timestamp: new Date().toISOString()
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's swap statistics
   */
  async getUserSwapStats(userId: string): Promise<SwapStats | null> {
    try {
      const response = await apiClient.get(`/api/swaps/users/${userId}/stats`) as { data: SwapStats };
      return response.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get user's created challenges
   */
  async getUserChallenges(userId: string, status?: 'active' | 'expired' | 'all'): Promise<SwapChallenge[]> {
    try {
      const params = status ? `?status=${status}` : '';
      const response = await apiClient.get(`/api/swaps/users/${userId}/challenges${params}`) as { data: { challenges: SwapChallenge[] } };
      return response.data.challenges || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get user's swap responses
   */
  async getUserResponses(userId: string, limit = 20): Promise<SwapResponse[]> {
    try {
      const response = await apiClient.get(`/api/swaps/users/${userId}/responses?limit=${limit}`) as { data: { responses: SwapResponse[] } };
      return response.data.responses || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Delete a swap challenge (only by creator)
   */
  async deleteChallenge(challengeId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/swaps/challenges/${challengeId}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Report inappropriate swap content
   */
  async reportSwapContent(contentId: string, contentType: 'challenge' | 'response', reason: string): Promise<boolean> {
    try {
      await apiClient.post('/api/swaps/report', {
        contentId,
        contentType,
        reason,
        timestamp: new Date().toISOString()
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get trending swap challenges
   */
  async getTrendingChallenges(limit = 10): Promise<SwapChallenge[]> {
    try {
      const response = await apiClient.get(`/api/swaps/trending?limit=${limit}`) as { data: { challenges: SwapChallenge[] } };
      return response.data.challenges || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Search swap challenges
   */
  async searchChallenges(query: string, filters?: {
    category?: string;
    difficulty?: string;
    location?: string;
  }): Promise<SwapChallenge[]> {
    try {
      const params = new URLSearchParams({ q: query });
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.difficulty) params.append('difficulty', filters.difficulty);
      if (filters?.location) params.append('location', filters.location);

      const response = await apiClient.get(`/api/swaps/search?${params}`) as { data: { challenges: SwapChallenge[] } };
      return response.data.challenges || [];
    } catch (error) {
      return [];
    }
  }
}

export const swapService = new SwapService();
