import { shareService, ShareData } from '@/services/shareService';
import apiClient from '@/lib/api';

// Mock the API client
jest.mock('@/lib/api');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('ShareService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sharePost', () => {
    it('should share a post successfully', async () => {
      const mockResponse = {
        shareId: 'share123',
        shareUrl: 'https://example.com/share/123'
      };
      
      mockedApiClient.post.mockResolvedValue(mockResponse);

      const shareData: ShareData = {
        postId: 'post123',
        shareType: 'post',
        message: 'Check this out!'
      };

      const result = await shareService.sharePost(shareData);

      expect(result.success).toBe(true);
      expect(result.shareId).toBe('share123');
      expect(result.shareUrl).toBe('https://example.com/share/123');
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/shares', {
        postId: 'post123',
        shareType: 'post',
        message: 'Check this out!',
        recipients: undefined,
        timestamp: expect.any(String)
      });
    });

    it('should handle share post error', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Share failed'
          }
        }
      };
      
      mockedApiClient.post.mockRejectedValue(mockError);

      const shareData: ShareData = {
        postId: 'post123',
        shareType: 'post'
      };

      const result = await shareService.sharePost(shareData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Share failed');
    });
  });

  describe('shareToExternalPlatform', () => {
    it('should share to external platform successfully', async () => {
      const mockResponse = {
        shareId: 'external123',
        shareUrl: 'https://facebook.com/share/123'
      };
      
      mockedApiClient.post.mockResolvedValue(mockResponse);

      const shareData: ShareData = {
        postId: 'post123',
        shareType: 'post',
        platform: 'facebook',
        message: 'Check this out!'
      };

      const result = await shareService.shareToExternalPlatform(shareData);

      expect(result.success).toBe(true);
      expect(result.shareId).toBe('external123');
      expect(result.message).toBe('Shared to facebook successfully');
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/shares/external', {
        postId: 'post123',
        platform: 'facebook',
        message: 'Check this out!',
        timestamp: expect.any(String)
      });
    });
  });

  describe('getShareStats', () => {
    it('should get share statistics successfully', async () => {
      const mockStats = {
        totalShares: 25,
        sharesByPlatform: {
          facebook: 10,
          twitter: 8,
          instagram: 7
        },
        recentShares: [
          {
            id: 'share1',
            userId: 'user1',
            userName: 'John Doe',
            shareType: 'post',
            timestamp: '2023-01-01T00:00:00Z'
          }
        ]
      };
      
      mockedApiClient.get.mockResolvedValue(mockStats);

      const result = await shareService.getShareStats('post123');

      expect(result).toEqual(mockStats);
      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/shares/stats/post123');
    });

    it('should handle get share stats error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));

      const result = await shareService.getShareStats('post123');

      expect(result).toBeNull();
    });
  });

  describe('generateShareLink', () => {
    it('should generate share link successfully', async () => {
      const mockResponse = {
        shareUrl: 'https://example.com/share/abc123'
      };
      
      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await shareService.generateShareLink('post123', {
        expiresIn: 24,
        allowDownload: true
      });

      expect(result).toBe('https://example.com/share/abc123');
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/shares/generate-link', {
        postId: 'post123',
        expiresIn: 24,
        allowDownload: true,
        timestamp: expect.any(String)
      });
    });

    it('should handle generate share link error', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Network error'));

      const result = await shareService.generateShareLink('post123');

      expect(result).toBeNull();
    });
  });

  describe('trackShareEvent', () => {
    it('should track share event successfully', async () => {
      mockedApiClient.post.mockResolvedValue({});

      await shareService.trackShareEvent('share123', 'view');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/shares/share123/track', {
        event: 'view',
        timestamp: expect.any(String),
        userAgent: expect.any(String),
        referrer: expect.any(String)
      });
    });

    it('should handle track share event error silently', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Network error'));

      // Should not throw
      await expect(shareService.trackShareEvent('share123', 'view')).resolves.toBeUndefined();
    });
  });

  describe('deleteShare', () => {
    it('should delete share successfully', async () => {
      mockedApiClient.delete.mockResolvedValue({});

      const result = await shareService.deleteShare('share123');

      expect(result).toBe(true);
      expect(mockedApiClient.delete).toHaveBeenCalledWith('/api/shares/share123');
    });

    it('should handle delete share error', async () => {
      mockedApiClient.delete.mockRejectedValue(new Error('Network error'));

      const result = await shareService.deleteShare('share123');

      expect(result).toBe(false);
    });
  });
});
