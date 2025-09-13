import apiClient from '../lib/api';

export interface ShareData {
  postId: string;
  shareType: 'story' | 'post' | 'message' | 'external';
  message?: string;
  recipients?: string[];
  platform?: 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'telegram';
}

export interface ShareResponse {
  success: boolean;
  shareId?: string;
  message?: string;
  shareUrl?: string;
}

export interface ShareStats {
  totalShares: number;
  sharesByPlatform: Record<string, number>;
  recentShares: Array<{
    id: string;
    userId: string;
    userName: string;
    shareType: string;
    timestamp: string;
    platform?: string;
  }>;
}

class ShareService {
  /**
   * Share a post internally within the platform
   */
  async sharePost(shareData: ShareData): Promise<ShareResponse> {
    try {
      const response = await apiClient.post<{ shareId: string; shareUrl: string }>('/api/shares', {
        postId: shareData.postId,
        shareType: shareData.shareType,
        message: shareData.message,
        recipients: shareData.recipients,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        shareId: response.shareId,
        message: 'Post shared successfully',
        shareUrl: response.shareUrl
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Share to external platform
   */
  async shareToExternalPlatform(shareData: ShareData): Promise<ShareResponse> {
    try {
      const response = await apiClient.post<{ shareId: string; shareUrl: string }>('/api/shares/external', {
        postId: shareData.postId,
        platform: shareData.platform,
        message: shareData.message,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        shareId: response.shareId,
        message: `Shared to ${shareData.platform} successfully`,
        shareUrl: response.shareUrl
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || `Failed to share to ${shareData.platform}`
      };
    }
  }

  /**
   * Get share statistics for a post
   */
  async getShareStats(postId: string): Promise<ShareStats | null> {
    try {
      const response = await apiClient.get<ShareStats>(`/api/shares/stats/${postId}`);
      return response;
    } catch (error: any) {
      return null;
    }
  }

  /**
   * Get user's sharing history
   */
  async getUserShares(userId: string, limit = 20): Promise<any[]> {
    try {
      const response = await apiClient.get<{ shares: any[] }>(`/api/users/${userId}/shares?limit=${limit}`);
      return response.shares || [];
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Delete a share
   */
  async deleteShare(shareId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/shares/${shareId}`);
      return true;
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Generate shareable link for a post
   */
  async generateShareLink(postId: string, options?: {
    expiresIn?: number; // hours
    password?: string;
    allowDownload?: boolean;
  }): Promise<string | null> {
    try {
      const response = await apiClient.post<{ shareUrl: string }>(`/api/shares/generate-link`, {
        postId,
        ...options,
        timestamp: new Date().toISOString()
      });
      
      return response.shareUrl;
    } catch (error: any) {
      return null;
    }
  }

  /**
   * Track share analytics
   */
  async trackShareEvent(shareId: string, event: 'view' | 'click' | 'download'): Promise<void> {
    try {
      await apiClient.post(`/api/shares/${shareId}/track`, {
        event,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer
      });
    } catch (error: any) {
      // Silent fail for analytics
    }
  }
}

export const shareService = new ShareService();
