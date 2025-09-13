'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Copy, MessageCircle, Users, ExternalLink, Check, X } from 'lucide-react';
import { shareService, ShareData, ShareResponse } from '@/services/shareService';

interface ModernShareComponentProps {
  postId: string;
  postTitle?: string;
  postImage?: string;
  onClose?: () => void;
  className?: string;
}

interface ShareOption {
  id: string;
  name: string;
  icon: string;
  color: string;
  action: 'internal' | 'external' | 'copy';
  platform?: string;
}

export const ModernShareComponent: React.FC<ModernShareComponentProps> = ({
  postId,
  postTitle = "Check out this post!",
  postImage,
  onClose,
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareStats, setShareStats] = useState<any>(null);

  const shareOptions: ShareOption[] = [
    { id: 'story', name: 'Share to Story', icon: '📖', color: 'bg-purple-500', action: 'internal' },
    { id: 'post', name: 'Share as Post', icon: '📝', color: 'bg-blue-500', action: 'internal' },
    { id: 'message', name: 'Send Message', icon: '💬', color: 'bg-green-500', action: 'internal' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'bg-blue-600', action: 'external', platform: 'facebook' },
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'bg-sky-500', action: 'external', platform: 'twitter' },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-500', action: 'external', platform: 'instagram' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💚', color: 'bg-green-600', action: 'external', platform: 'whatsapp' },
    { id: 'telegram', name: 'Telegram', icon: '✈️', color: 'bg-blue-400', action: 'external', platform: 'telegram' },
    { id: 'copy', name: 'Copy Link', icon: '🔗', color: 'bg-gray-500', action: 'copy' }
  ];

  useEffect(() => {
    loadShareStats();
    generateShareUrl();
  }, [postId]);

  const loadShareStats = async () => {
    const stats = await shareService.getShareStats(postId);
    setShareStats(stats);
  };

  const generateShareUrl = async () => {
    const url = await shareService.generateShareLink(postId, {
      expiresIn: 24 * 7, // 1 week
      allowDownload: true
    });
    if (url) {
      setShareUrl(url);
    }
  };

  const handleShare = async (option: ShareOption) => {
    if (option.action === 'copy') {
      await handleCopyLink();
      return;
    }

    setIsLoading(true);
    
    try {
      const shareData: ShareData = {
        postId,
        shareType: option.id as any,
        message: shareMessage.trim() || undefined,
        recipients: selectedRecipients.length > 0 ? selectedRecipients : undefined,
        platform: option.platform as any
      };

      let response: ShareResponse;
      
      if (option.action === 'external') {
        response = await shareService.shareToExternalPlatform(shareData);
      } else {
        response = await shareService.sharePost(shareData);
      }

      if (response.success) {
        // Track the share event
        if (response.shareId) {
          await shareService.trackShareEvent(response.shareId, 'click');
        }
        
        // Refresh stats
        await loadShareStats();
        
        // Show success message
        showSuccessMessage(response.message || 'Shared successfully!');
        
        // Close modal after successful share
        setTimeout(() => {
          onClose?.();
        }, 1500);
      } else {
        showErrorMessage(response.message || 'Failed to share');
      }
    } catch (error) {
      console.error('Share error:', error);
      showErrorMessage('An error occurred while sharing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      showSuccessMessage('Link copied to clipboard!');
      
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Copy error:', error);
      showErrorMessage('Failed to copy link');
    }
  };

  const showSuccessMessage = (message: string) => {
    // You can implement a toast notification system here
    console.log('Success:', message);
  };

  const showErrorMessage = (message: string) => {
    // You can implement a toast notification system here
    console.error('Error:', message);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Share Post</h3>
              <p className="text-sm text-gray-500">Choose how you'd like to share</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Post Preview */}
      {(postTitle || postImage) && (
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            {postImage && (
              <img
                src={postImage}
                alt="Post preview"
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">
                {postTitle}
              </p>
              {shareStats && (
                <p className="text-xs text-gray-500 mt-1">
                  {shareStats.totalShares} shares
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Message */}
      <div className="p-4 border-b border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add a message (optional)
        </label>
        <textarea
          value={shareMessage}
          onChange={(e) => setShareMessage(e.target.value)}
          placeholder="Write something about this post..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          maxLength={280}
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {shareMessage.length}/280
        </div>
      </div>

      {/* Share Options */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4">
          {shareOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleShare(option)}
              disabled={isLoading}
              className={`
                flex flex-col items-center p-4 rounded-xl transition-all duration-200
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:scale-105'}
                ${option.id === 'copy' && copySuccess ? 'bg-green-50' : ''}
              `}
            >
              <div className={`w-12 h-12 ${option.color} rounded-full flex items-center justify-center mb-2 text-white text-lg`}>
                {option.id === 'copy' && copySuccess ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span>{option.icon}</span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">
                {option.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Share URL */}
      {shareUrl && (
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Share Link
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={handleCopyLink}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {copySuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Share Stats */}
      {shareStats && shareStats.recentShares.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Shares</h4>
          <div className="space-y-2">
            {shareStats.recentShares.slice(0, 3).map((share: any) => (
              <div key={share.id} className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs">{share.userName[0]}</span>
                </div>
                <span>{share.userName} shared {share.shareType}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">
                  {new Date(share.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Sharing...</span>
          </div>
        </div>
      )}
    </div>
  );
};
