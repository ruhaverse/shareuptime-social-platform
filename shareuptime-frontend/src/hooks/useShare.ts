import { useState, useCallback } from 'react';
import { shareService, ShareData, ShareResponse } from '@/services/shareService';

export interface UseShareOptions {
  onSuccess?: (response: ShareResponse) => void;
  onError?: (error: string) => void;
}

export const useShare = (options: UseShareOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [shareStats, setShareStats] = useState<any>(null);

  const sharePost = useCallback(async (shareData: ShareData): Promise<ShareResponse> => {
    setIsLoading(true);
    
    try {
      const response = await shareService.sharePost(shareData);
      
      if (response.success) {
        options.onSuccess?.(response);
        
        // Track the share event
        if (response.shareId) {
          await shareService.trackShareEvent(response.shareId, 'click');
        }
      } else {
        options.onError?.(response.message || 'Failed to share post');
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred while sharing';
      options.onError?.(errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const shareToExternalPlatform = useCallback(async (shareData: ShareData): Promise<ShareResponse> => {
    setIsLoading(true);
    
    try {
      const response = await shareService.shareToExternalPlatform(shareData);
      
      if (response.success) {
        options.onSuccess?.(response);
        
        // Track the share event
        if (response.shareId) {
          await shareService.trackShareEvent(response.shareId, 'click');
        }
      } else {
        options.onError?.(response.message || `Failed to share to ${shareData.platform}`);
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred while sharing';
      options.onError?.(errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const generateShareLink = useCallback(async (postId: string, options?: {
    expiresIn?: number;
    password?: string;
    allowDownload?: boolean;
  }): Promise<string | null> => {
    try {
      return await shareService.generateShareLink(postId, options);
    } catch (error) {
      console.error('Error generating share link:', error);
      return null;
    }
  }, []);

  const loadShareStats = useCallback(async (postId: string) => {
    try {
      const stats = await shareService.getShareStats(postId);
      setShareStats(stats);
      return stats;
    } catch (error) {
      console.error('Error loading share stats:', error);
      return null;
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }, []);

  return {
    isLoading,
    shareStats,
    sharePost,
    shareToExternalPlatform,
    generateShareLink,
    loadShareStats,
    copyToClipboard
  };
};
