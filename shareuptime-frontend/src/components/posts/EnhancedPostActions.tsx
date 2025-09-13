'use client';

import React, { useState } from 'react';
import { shareupColors } from '@/styles/shareup-colors';

interface PostActionsProps {
  postId: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  showComments?: boolean;
}

export const EnhancedPostActions: React.FC<PostActionsProps> = ({
  postId,
  likes,
  comments,
  shares,
  isLiked,
  isSaved,
  onLike,
  onComment,
  onShare,
  onSave,
  showComments = false
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(false);

  const handleLike = () => {
    setLikeAnimation(true);
    onLike();
    setTimeout(() => setLikeAnimation(false), 300);
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const shareOptions = [
    { icon: '📱', label: 'Share to Story', action: () => console.log('Share to story') },
    { icon: '💬', label: 'Send Message', action: () => console.log('Send message') },
    { icon: '📋', label: 'Copy Link', action: () => navigator.clipboard.writeText(window.location.href) },
    { icon: '📧', label: 'Share via Email', action: () => console.log('Share via email') },
  ];

  return (
    <div className="border-t border-shareup-lighter-gray pt-3">
      {/* Main Action Buttons */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-6">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`
              flex items-center space-x-2 transition-all duration-200
              ${isLiked ? 'text-red-500' : 'text-shareup-gray hover:text-red-500'}
              ${likeAnimation ? 'scale-110' : 'scale-100'}
            `}
          >
            <span className={`text-xl ${likeAnimation ? 'animate-bounce' : ''}`}>
              {isLiked ? '❤️' : '🤍'}
            </span>
            <span className="font-medium text-sm">{formatCount(likes)}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={onComment}
            className="flex items-center space-x-2 text-shareup-gray hover:text-shareup-primary transition-colors duration-200"
          >
            <span className="text-xl">💬</span>
            <span className="font-medium text-sm">{formatCount(comments)}</span>
          </button>

          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center space-x-2 text-shareup-gray hover:text-shareup-primary transition-colors duration-200"
            >
              <span className="text-xl">📤</span>
              <span className="font-medium text-sm">{formatCount(shares)}</span>
            </button>

            {/* Share Menu */}
            {showShareMenu && (
              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-shareup-lighter-gray p-2 z-10 min-w-48">
                {shareOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      option.action();
                      setShowShareMenu(false);
                      onShare();
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-shareup-light rounded-lg transition-colors duration-200"
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-shareup-dark font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={onSave}
          className={`
            transition-colors duration-200
            ${isSaved ? 'text-shareup-primary' : 'text-shareup-gray hover:text-shareup-primary'}
          `}
        >
          <span className="text-xl">{isSaved ? '🔖' : '📌'}</span>
        </button>
      </div>

      {/* Engagement Summary */}
      <div className="flex items-center justify-between text-sm text-shareup-gray mb-2">
        <div className="flex items-center space-x-4">
          {likes > 0 && (
            <span>{formatCount(likes)} {likes === 1 ? 'like' : 'likes'}</span>
          )}
          {comments > 0 && (
            <button onClick={onComment} className="hover:underline">
              {formatCount(comments)} {comments === 1 ? 'comment' : 'comments'}
            </button>
          )}
        </div>
        {shares > 0 && (
          <span>{formatCount(shares)} {shares === 1 ? 'share' : 'shares'}</span>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center space-x-4 pt-2 border-t border-shareup-lighter-gray">
        <button
          onClick={handleLike}
          className={`
            flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200
            ${isLiked 
              ? 'bg-red-50 text-red-600 border border-red-200' 
              : 'hover:bg-shareup-light text-shareup-gray'
            }
          `}
        >
          {isLiked ? '❤️ Liked' : '🤍 Like'}
        </button>

        <button
          onClick={onComment}
          className="flex-1 py-2 px-4 rounded-lg font-medium text-shareup-gray hover:bg-shareup-light transition-all duration-200"
        >
          💬 Comment
        </button>

        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="flex-1 py-2 px-4 rounded-lg font-medium text-shareup-gray hover:bg-shareup-light transition-all duration-200"
        >
          📤 Share
        </button>
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
};
