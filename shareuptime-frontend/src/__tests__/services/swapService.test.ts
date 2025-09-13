import { swapService, SwapCreateData } from '@/services/swapService';
import apiClient from '@/lib/api';

// Mock the API client
jest.mock('@/lib/api');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('SwapService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSwapChallenge', () => {
    it('should create swap challenge successfully', async () => {
      const mockResponse = {
        challengeId: 'challenge123'
      };
      
      mockedApiClient.post.mockResolvedValue(mockResponse);

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const swapData: SwapCreateData = {
        originalImage: mockFile,
        caption: 'Test challenge',
        location: 'Test Location',
        timeLimit: 24,
        tags: ['test', 'challenge'],
        difficulty: 'medium'
      };

      const result = await swapService.createSwapChallenge(swapData);

      expect(result.success).toBe(true);
      expect(result.challengeId).toBe('challenge123');
      expect(result.message).toBe('Swap challenge created successfully');
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/api/swaps/challenges',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    });

    it('should handle create swap challenge error', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Challenge creation failed'
          }
        }
      };
      
      mockedApiClient.post.mockRejectedValue(mockError);

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const swapData: SwapCreateData = {
        originalImage: mockFile,
        caption: 'Test challenge',
        timeLimit: 24
      };

      const result = await swapService.createSwapChallenge(swapData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Challenge creation failed');
    });
  });

  describe('submitSwapResponse', () => {
    it('should submit swap response successfully', async () => {
      const mockResponse = {
        responseId: 'response123'
      };
      
      mockedApiClient.post.mockResolvedValue(mockResponse);

      const mockFile = new File(['test'], 'response.jpg', { type: 'image/jpeg' });
      
      const result = await swapService.submitSwapResponse('challenge123', mockFile, 'My response');

      expect(result.success).toBe(true);
      expect(result.responseId).toBe('response123');
      expect(result.message).toBe('Swap response submitted successfully');
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/api/swaps/responses',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    });
  });

  describe('getActiveChallenges', () => {
    it('should get active challenges successfully', async () => {
      const mockChallenges = [
        {
          id: 'challenge1',
          userId: 'user1',
          originalImage: 'image1.jpg',
          caption: 'Challenge 1',
          timeLimit: 24,
          createdAt: '2023-01-01T00:00:00Z',
          expiresAt: '2023-01-02T00:00:00Z',
          isActive: true
        }
      ];
      
      mockedApiClient.get.mockResolvedValue({ challenges: mockChallenges });

      const result = await swapService.getActiveChallenges(1, 20, {
        category: 'photography',
        difficulty: 'medium'
      });

      expect(result).toEqual(mockChallenges);
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/swaps/challenges?')
      );
    });

    it('should handle get active challenges error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));

      const result = await swapService.getActiveChallenges();

      expect(result).toEqual([]);
    });
  });

  describe('getChallengeDetails', () => {
    it('should get challenge details successfully', async () => {
      const mockData = {
        challenge: {
          id: 'challenge1',
          userId: 'user1',
          originalImage: 'image1.jpg',
          caption: 'Challenge 1',
          timeLimit: 24,
          createdAt: '2023-01-01T00:00:00Z',
          expiresAt: '2023-01-02T00:00:00Z',
          isActive: true
        },
        responses: [
          {
            id: 'response1',
            challengeId: 'challenge1',
            userId: 'user2',
            responseImage: 'response1.jpg',
            submittedAt: '2023-01-01T12:00:00Z',
            votes: 5
          }
        ],
        userResponse: undefined
      };
      
      mockedApiClient.get.mockResolvedValue(mockData);

      const result = await swapService.getChallengeDetails('challenge1');

      expect(result.challenge).toEqual(mockData.challenge);
      expect(result.responses).toEqual(mockData.responses);
      expect(result.userResponse).toBeUndefined();
      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/swaps/challenges/challenge1');
    });
  });

  describe('voteForResponse', () => {
    it('should vote for response successfully', async () => {
      mockedApiClient.post.mockResolvedValue({});

      const result = await swapService.voteForResponse('response123', 'up');

      expect(result).toBe(true);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/swaps/responses/response123/vote', {
        voteType: 'up',
        timestamp: expect.any(String)
      });
    });

    it('should handle vote for response error', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Network error'));

      const result = await swapService.voteForResponse('response123', 'up');

      expect(result).toBe(false);
    });
  });

  describe('getUserSwapStats', () => {
    it('should get user swap stats successfully', async () => {
      const mockStats = {
        totalChallenges: 10,
        activeChallenges: 3,
        totalResponses: 25,
        userRanking: 15,
        winRate: 0.6,
        popularCategories: [
          { category: 'photography', count: 8 },
          { category: 'art', count: 5 }
        ]
      };
      
      mockedApiClient.get.mockResolvedValue(mockStats);

      const result = await swapService.getUserSwapStats('user123');

      expect(result).toEqual(mockStats);
      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/swaps/users/user123/stats');
    });

    it('should handle get user swap stats error', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));

      const result = await swapService.getUserSwapStats('user123');

      expect(result).toBeNull();
    });
  });

  describe('searchChallenges', () => {
    it('should search challenges successfully', async () => {
      const mockChallenges = [
        {
          id: 'challenge1',
          userId: 'user1',
          originalImage: 'image1.jpg',
          caption: 'Photography challenge',
          timeLimit: 24,
          createdAt: '2023-01-01T00:00:00Z',
          expiresAt: '2023-01-02T00:00:00Z',
          isActive: true
        }
      ];
      
      mockedApiClient.get.mockResolvedValue({ challenges: mockChallenges });

      const result = await swapService.searchChallenges('photography', {
        category: 'art',
        difficulty: 'medium'
      });

      expect(result).toEqual(mockChallenges);
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/swaps/search?')
      );
    });
  });

  describe('deleteChallenge', () => {
    it('should delete challenge successfully', async () => {
      mockedApiClient.delete.mockResolvedValue({});

      const result = await swapService.deleteChallenge('challenge123');

      expect(result).toBe(true);
      expect(mockedApiClient.delete).toHaveBeenCalledWith('/api/swaps/challenges/challenge123');
    });

    it('should handle delete challenge error', async () => {
      mockedApiClient.delete.mockRejectedValue(new Error('Network error'));

      const result = await swapService.deleteChallenge('challenge123');

      expect(result).toBe(false);
    });
  });

  describe('reportSwapContent', () => {
    it('should report swap content successfully', async () => {
      mockedApiClient.post.mockResolvedValue({});

      const result = await swapService.reportSwapContent('challenge123', 'challenge', 'Inappropriate content');

      expect(result).toBe(true);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/swaps/report', {
        contentId: 'challenge123',
        contentType: 'challenge',
        reason: 'Inappropriate content',
        timestamp: expect.any(String)
      });
    });

    it('should handle report swap content error', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Network error'));

      const result = await swapService.reportSwapContent('challenge123', 'challenge', 'Inappropriate content');

      expect(result).toBe(false);
    });
  });
});
