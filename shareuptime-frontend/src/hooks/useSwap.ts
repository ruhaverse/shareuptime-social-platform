import { useState, useCallback, useEffect } from 'react';
import { swapService, SwapChallenge, SwapResponse, SwapCreateData, SwapStats } from '@/services/swapService';

export interface UseSwapOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export const useSwap = (options: UseSwapOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [challenges, setChallenges] = useState<SwapChallenge[]>([]);
  const [userStats, setUserStats] = useState<SwapStats | null>(null);
  const [trendingChallenges, setTrendingChallenges] = useState<SwapChallenge[]>([]);

  const createChallenge = useCallback(async (swapData: SwapCreateData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const result = await swapService.createSwapChallenge(swapData);
      
      if (result.success) {
        options.onSuccess?.('Swap challenge created successfully!');
        // Refresh challenges list
        await loadActiveChallenges();
        return true;
      } else {
        options.onError?.(result.message || 'Failed to create swap challenge');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred while creating swap challenge';
      options.onError?.(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const submitResponse = useCallback(async (challengeId: string, responseImage: File, caption?: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const result = await swapService.submitSwapResponse(challengeId, responseImage, caption);
      
      if (result.success) {
        options.onSuccess?.('Swap response submitted successfully!');
        // Refresh challenges to show updated responses
        await loadActiveChallenges();
        return true;
      } else {
        options.onError?.(result.message || 'Failed to submit swap response');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred while submitting response';
      options.onError?.(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const loadActiveChallenges = useCallback(async (page = 1, limit = 20, filters?: {
    category?: string;
    difficulty?: string;
    location?: string;
    tags?: string[];
  }) => {
    try {
      const challengesList = await swapService.getActiveChallenges(page, limit, filters);
      setChallenges(challengesList);
      return challengesList;
    } catch (error) {
      console.error('Error loading active challenges:', error);
      return [];
    }
  }, []);

  const loadChallengeDetails = useCallback(async (challengeId: string) => {
    try {
      return await swapService.getChallengeDetails(challengeId);
    } catch (error) {
      console.error('Error loading challenge details:', error);
      return {
        challenge: null,
        responses: [],
        userResponse: undefined
      };
    }
  }, []);

  const voteForResponse = useCallback(async (responseId: string, voteType: 'up' | 'down'): Promise<boolean> => {
    try {
      const success = await swapService.voteForResponse(responseId, voteType);
      if (success) {
        options.onSuccess?.('Vote submitted successfully!');
        // Refresh challenges to show updated vote counts
        await loadActiveChallenges();
      } else {
        options.onError?.('Failed to submit vote');
      }
      return success;
    } catch (error: any) {
      options.onError?.(error.message || 'An error occurred while voting');
      return false;
    }
  }, [options, loadActiveChallenges]);

  const loadUserStats = useCallback(async (userId: string) => {
    try {
      const stats = await swapService.getUserSwapStats(userId);
      setUserStats(stats);
      return stats;
    } catch (error) {
      console.error('Error loading user stats:', error);
      return null;
    }
  }, []);

  const loadTrendingChallenges = useCallback(async (limit = 10) => {
    try {
      const trending = await swapService.getTrendingChallenges(limit);
      setTrendingChallenges(trending);
      return trending;
    } catch (error) {
      console.error('Error loading trending challenges:', error);
      return [];
    }
  }, []);

  const searchChallenges = useCallback(async (query: string, filters?: {
    category?: string;
    difficulty?: string;
    location?: string;
  }) => {
    try {
      return await swapService.searchChallenges(query, filters);
    } catch (error) {
      console.error('Error searching challenges:', error);
      return [];
    }
  }, []);

  const deleteChallenge = useCallback(async (challengeId: string): Promise<boolean> => {
    try {
      const success = await swapService.deleteChallenge(challengeId);
      if (success) {
        options.onSuccess?.('Challenge deleted successfully!');
        // Refresh challenges list
        await loadActiveChallenges();
      } else {
        options.onError?.('Failed to delete challenge');
      }
      return success;
    } catch (error: any) {
      options.onError?.(error.message || 'An error occurred while deleting challenge');
      return false;
    }
  }, [options, loadActiveChallenges]);

  const reportContent = useCallback(async (contentId: string, contentType: 'challenge' | 'response', reason: string): Promise<boolean> => {
    try {
      const success = await swapService.reportSwapContent(contentId, contentType, reason);
      if (success) {
        options.onSuccess?.('Content reported successfully!');
      } else {
        options.onError?.('Failed to report content');
      }
      return success;
    } catch (error: any) {
      options.onError?.(error.message || 'An error occurred while reporting content');
      return false;
    }
  }, [options]);

  // Load initial data
  useEffect(() => {
    loadActiveChallenges();
    loadTrendingChallenges();
  }, [loadActiveChallenges, loadTrendingChallenges]);

  return {
    isLoading,
    challenges,
    userStats,
    trendingChallenges,
    createChallenge,
    submitResponse,
    loadActiveChallenges,
    loadChallengeDetails,
    voteForResponse,
    loadUserStats,
    loadTrendingChallenges,
    searchChallenges,
    deleteChallenge,
    reportContent
  };
};
