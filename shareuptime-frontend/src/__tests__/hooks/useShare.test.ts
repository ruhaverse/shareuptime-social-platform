import { renderHook, act } from '@testing-library/react';
import { useShare } from '@/hooks/useShare';
import { shareService } from '@/services/shareService';

// Mock the share service
jest.mock('@/services/shareService');
const mockedShareService = shareService as jest.Mocked<typeof shareService>;

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('useShare', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useShare());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.shareStats).toBeNull();
  });

  it('should handle successful post sharing', async () => {
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();
    
    mockedShareService.sharePost.mockResolvedValue({
      success: true,
      shareId: 'share123',
      message: 'Shared successfully!'
    });
    mockedShareService.trackShareEvent.mockResolvedValue();

    const { result } = renderHook(() => useShare({
      onSuccess: mockOnSuccess,
      onError: mockOnError
    }));

    let shareResult;
    await act(async () => {
      shareResult = await result.current.sharePost({
        postId: 'post123',
        shareType: 'post',
        message: 'Check this out!'
      });
    });

    expect(shareResult.success).toBe(true);
    expect(mockOnSuccess).toHaveBeenCalledWith({
      success: true,
      shareId: 'share123',
      message: 'Shared successfully!'
    });
    expect(mockOnError).not.toHaveBeenCalled();
    expect(mockedShareService.trackShareEvent).toHaveBeenCalledWith('share123', 'click');
  });

  it('should handle failed post sharing', async () => {
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();
    
    mockedShareService.sharePost.mockResolvedValue({
      success: false,
      message: 'Share failed'
    });

    const { result } = renderHook(() => useShare({
      onSuccess: mockOnSuccess,
      onError: mockOnError
    }));

    let shareResult;
    await act(async () => {
      shareResult = await result.current.sharePost({
        postId: 'post123',
        shareType: 'post'
      });
    });

    expect(shareResult.success).toBe(false);
    expect(mockOnError).toHaveBeenCalledWith('Share failed');
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should handle external platform sharing', async () => {
    const mockOnSuccess = jest.fn();
    
    mockedShareService.shareToExternalPlatform.mockResolvedValue({
      success: true,
      shareId: 'external123',
      message: 'Shared to facebook successfully!'
    });
    mockedShareService.trackShareEvent.mockResolvedValue();

    const { result } = renderHook(() => useShare({
      onSuccess: mockOnSuccess
    }));

    await act(async () => {
      await result.current.shareToExternalPlatform({
        postId: 'post123',
        shareType: 'post',
        platform: 'facebook'
      });
    });

    expect(mockedShareService.shareToExternalPlatform).toHaveBeenCalledWith({
      postId: 'post123',
      shareType: 'post',
      platform: 'facebook'
    });
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should generate share link', async () => {
    mockedShareService.generateShareLink.mockResolvedValue('https://example.com/share/abc123');

    const { result } = renderHook(() => useShare());

    let shareUrl;
    await act(async () => {
      shareUrl = await result.current.generateShareLink('post123', {
        expiresIn: 24,
        allowDownload: true
      });
    });

    expect(shareUrl).toBe('https://example.com/share/abc123');
    expect(mockedShareService.generateShareLink).toHaveBeenCalledWith('post123', {
      expiresIn: 24,
      allowDownload: true
    });
  });

  it('should load share stats', async () => {
    const mockStats = {
      totalShares: 25,
      sharesByPlatform: { facebook: 10, twitter: 8, instagram: 7 },
      recentShares: []
    };
    
    mockedShareService.getShareStats.mockResolvedValue(mockStats);

    const { result } = renderHook(() => useShare());

    let stats;
    await act(async () => {
      stats = await result.current.loadShareStats('post123');
    });

    expect(stats).toEqual(mockStats);
    expect(result.current.shareStats).toEqual(mockStats);
    expect(mockedShareService.getShareStats).toHaveBeenCalledWith('post123');
  });

  it('should copy to clipboard', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    (navigator.clipboard.writeText as jest.Mock) = mockWriteText;

    const { result } = renderHook(() => useShare());

    let success;
    await act(async () => {
      success = await result.current.copyToClipboard('https://example.com/share/abc123');
    });

    expect(success).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith('https://example.com/share/abc123');
  });

  it('should handle clipboard copy error', async () => {
    const mockWriteText = jest.fn().mockRejectedValue(new Error('Clipboard error'));
    (navigator.clipboard.writeText as jest.Mock) = mockWriteText;

    const { result } = renderHook(() => useShare());

    let success;
    await act(async () => {
      success = await result.current.copyToClipboard('https://example.com/share/abc123');
    });

    expect(success).toBe(false);
  });

  it('should handle service errors gracefully', async () => {
    const mockOnError = jest.fn();
    
    mockedShareService.sharePost.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useShare({
      onError: mockOnError
    }));

    let shareResult;
    await act(async () => {
      shareResult = await result.current.sharePost({
        postId: 'post123',
        shareType: 'post'
      });
    });

    expect(shareResult.success).toBe(false);
    expect(mockOnError).toHaveBeenCalledWith('Network error');
  });

  it('should set loading state during operations', async () => {
    mockedShareService.sharePost.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    const { result } = renderHook(() => useShare());

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.sharePost({
        postId: 'post123',
        shareType: 'post'
      });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(result.current.isLoading).toBe(false);
  });
});
