import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModernShareComponent } from '@/components/ui/ModernShareComponent';
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

describe('ModernShareComponent', () => {
  const defaultProps = {
    postId: 'post123',
    postTitle: 'Test Post Title',
    postImage: 'https://example.com/image.jpg'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedShareService.getShareStats.mockResolvedValue({
      totalShares: 10,
      sharesByPlatform: { facebook: 5, twitter: 3, instagram: 2 },
      recentShares: [
        {
          id: 'share1',
          userId: 'user1',
          userName: 'John Doe',
          shareType: 'post',
          timestamp: '2023-01-01T00:00:00Z'
        }
      ]
    });
    mockedShareService.generateShareLink.mockResolvedValue('https://example.com/share/abc123');
  });

  it('renders share component with post preview', async () => {
    render(<ModernShareComponent {...defaultProps} />);

    expect(screen.getByText('Share Post')).toBeInTheDocument();
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Post preview' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('10 shares')).toBeInTheDocument();
    });
  });

  it('displays share options', () => {
    render(<ModernShareComponent {...defaultProps} />);

    expect(screen.getByText('Share to Story')).toBeInTheDocument();
    expect(screen.getByText('Share as Post')).toBeInTheDocument();
    expect(screen.getByText('Send Message')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('Telegram')).toBeInTheDocument();
    expect(screen.getByText('Copy Link')).toBeInTheDocument();
  });

  it('handles message input', () => {
    render(<ModernShareComponent {...defaultProps} />);

    const messageInput = screen.getByPlaceholderText('Write something about this post...');
    fireEvent.change(messageInput, { target: { value: 'Check this out!' } });

    expect(messageInput).toHaveValue('Check this out!');
    expect(screen.getByText('15/280')).toBeInTheDocument();
  });

  it('handles internal share successfully', async () => {
    mockedShareService.sharePost.mockResolvedValue({
      success: true,
      shareId: 'share123',
      message: 'Shared successfully!'
    });
    mockedShareService.trackShareEvent.mockResolvedValue();

    render(<ModernShareComponent {...defaultProps} />);

    const shareButton = screen.getByText('Share to Story');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockedShareService.sharePost).toHaveBeenCalledWith({
        postId: 'post123',
        shareType: 'story',
        message: undefined,
        recipients: undefined,
        platform: undefined
      });
    });

    await waitFor(() => {
      expect(mockedShareService.trackShareEvent).toHaveBeenCalledWith('share123', 'click');
    });
  });

  it('handles external share successfully', async () => {
    mockedShareService.shareToExternalPlatform.mockResolvedValue({
      success: true,
      shareId: 'external123',
      message: 'Shared to facebook successfully!'
    });
    mockedShareService.trackShareEvent.mockResolvedValue();

    render(<ModernShareComponent {...defaultProps} />);

    const facebookButton = screen.getByText('Facebook');
    fireEvent.click(facebookButton);

    await waitFor(() => {
      expect(mockedShareService.shareToExternalPlatform).toHaveBeenCalledWith({
        postId: 'post123',
        shareType: 'facebook',
        message: undefined,
        recipients: undefined,
        platform: 'facebook'
      });
    });
  });

  it('handles copy link functionality', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    (navigator.clipboard.writeText as jest.Mock) = mockWriteText;

    render(<ModernShareComponent {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('https://example.com/share/abc123')).toBeInTheDocument();
    });

    const copyButton = screen.getByText('Copy Link');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('https://example.com/share/abc123');
    });
  });

  it('handles share failure', async () => {
    mockedShareService.sharePost.mockResolvedValue({
      success: false,
      message: 'Share failed'
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<ModernShareComponent {...defaultProps} />);

    const shareButton = screen.getByText('Share to Story');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error:', 'Share failed');
    });

    consoleSpy.mockRestore();
  });

  it('displays recent shares when available', async () => {
    render(<ModernShareComponent {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Recent Shares')).toBeInTheDocument();
      expect(screen.getByText('John Doe shared post')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    render(<ModernShareComponent {...defaultProps} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows loading state during share operation', async () => {
    mockedShareService.sharePost.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<ModernShareComponent {...defaultProps} />);

    const shareButton = screen.getByText('Share to Story');
    fireEvent.click(shareButton);

    expect(screen.getByText('Sharing...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Sharing...')).not.toBeInTheDocument();
    }, { timeout: 200 });
  });

  it('handles share with custom message', async () => {
    mockedShareService.sharePost.mockResolvedValue({
      success: true,
      shareId: 'share123'
    });

    render(<ModernShareComponent {...defaultProps} />);

    const messageInput = screen.getByPlaceholderText('Write something about this post...');
    fireEvent.change(messageInput, { target: { value: 'Amazing content!' } });

    const shareButton = screen.getByText('Share as Post');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockedShareService.sharePost).toHaveBeenCalledWith({
        postId: 'post123',
        shareType: 'post',
        message: 'Amazing content!',
        recipients: undefined,
        platform: undefined
      });
    });
  });
});
