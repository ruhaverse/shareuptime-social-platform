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
      const response = await apiClient.post('/api/shares', {
        postId: shareData.postId,
        shareType: shareData.shareType,
        message: shareData.message,
        recipients: shareData.recipients,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        shareId: response.data.shareId,
        message: 'Post shared successfully',
        shareUrl: response.data.shareUrl
      };
    } catch (error: any) {
      console.error('Share post error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to share post'
      };
    }
  }

  /**
   * Share to external platform
   */
  async shareToExternalPlatform(shareData: ShareData): Promise<ShareResponse> {
    try {
      const response = await apiClient.post('/api/shares/external', {
        postId: shareData.postId,
        platform: shareData.platform,
        message: shareData.message,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        shareId: response.data.shareId,
        message: `Shared to ${shareData.platform} successfully`,
        shareUrl: response.data.shareUrl
      };
    } catch (error: any) {
      console.error('External share error:', error);
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
      const response = await apiClient.get(`/api/shares/stats/${postId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get share stats error:', error);
      return null;
    }
  }

  /**
   * Get user's sharing history
   */
  async getUserShares(userId: string, limit = 20): Promise<any[]> {
    try {
      const response = await apiClient.get(`/api/users/${userId}/shares?limit=${limit}`);
      return response.data.shares || [];
    } catch (error: any) {
      console.error('Get user shares error:', error);
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
      console.error('Delete share error:', error);
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
      const response = await apiClient.post(`/api/shares/generate-link`, {
        postId,
        ...options,
        timestamp: new Date().toISOString()
      });
      
      return response.data.shareUrl;
    } catch (error: any) {
      console.error('Generate share link error:', error);
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
      console.error('Track share event error:', error);
    }
  }
}

export const shareService = new ShareService();
