'use client';

import React, { useState } from 'react';
import { Star, MessageCircle, Share2, Bookmark, MoreHorizontal, Send, Copy, Eye } from 'lucide-react';
import { shareupColors } from '@/styles/shareup-colors';

interface AdvancedPostActionsProps {
  postId: string;
  postData?: {
    user: {
      profilePicturePath?: string;
      firstName?: string;
      lastName?: string;
    };
    published?: string;
    content?: string;
  };
  userId?: string;
  initialLikes: number;
  initialComments: number;
  initialShares?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onMore?: () => void;
  onUserProfile?: () => void;
}

export const AdvancedPostActions: React.FC<AdvancedPostActionsProps> = ({
  postId,
  postData,
  userId,
  initialLikes,
  initialComments,
  initialShares = 0,
  isLiked = false,
  isSaved = false,
  onLike,
  onComment,
  onShare,
  onSave,
  onMore,
  onUserProfile
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const [likes, setLikes] = useState(initialLikes);
  const [shares, setShares] = useState(initialShares);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
    onLike?.();
  };

  const handleSave = () => {
    setSaved(!saved);
    onSave?.();
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
    setShares(prev => prev + 1);
    onShare?.();
  };

  const handleOptions = () => {
    setShowOptionsMenu(!showOptionsMenu);
    onMore?.();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative bg-white">
      {/* User Info Header */}
      {postData?.user && (
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button onClick={onUserProfile} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center overflow-hidden">
                {postData.user.profilePicturePath ? (
                  <img
                    src={postData.user.profilePicturePath}
                    alt={postData.user.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-lg">
                    {postData.user.firstName?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">
                  {postData.user.firstName} {postData.user.lastName}
                </h3>
                {postData.published && (
                  <p className="text-xs text-gray-500">{formatDate(postData.published)}</p>
                )}
              </div>
            </button>
          </div>

          {/* Top Action Indicators */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-xs font-semibold text-gray-700">{likes}</span>
            </div>
            <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold text-gray-700">{initialComments}</span>
            </div>
            <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full">
              <Share2 className="w-4 h-4 text-green-500" />
              <span className="text-xs font-semibold text-gray-700">{shares}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Actions Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        {/* Left Actions */}
        <div className="flex items-center space-x-6">
          {/* Like Button with Star */}
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-all duration-300 hover:scale-110 group ${
              liked ? 'text-yellow-500' : 'text-gray-600 hover:text-yellow-500'
            }`}
          >
            <div className="relative">
              <Star 
                className={`w-5 h-5 transition-all duration-300 ${
                  liked ? 'fill-current scale-110' : 'group-hover:scale-110'
                }`} 
              />
              {liked && (
                <div className="absolute inset-0 animate-ping">
                  <Star className="w-5 h-5 text-yellow-400 opacity-75" />
                </div>
              )}
            </div>
            <span className="text-sm font-bold">{likes}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={onComment}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-all duration-200 hover:scale-110 group"
          >
            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold">{initialComments} Comments</span>
          </button>

          {/* Share Count Display */}
          <div className="flex items-center space-x-2 text-gray-600">
            <Eye className="w-5 h-5" />
            <span className="text-sm font-bold">{shares} Shares</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-1">
          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`p-2 rounded-full transition-all duration-200 hover:scale-110 hover:bg-gray-100 ${
              saved ? 'text-yellow-500' : 'text-gray-600 hover:text-yellow-500'
            }`}
            title="Save Post"
          >
            <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-full text-gray-600 hover:text-green-500 hover:bg-gray-100 transition-all duration-200 hover:scale-110"
            title="Share Post"
          >
            <Send className="w-5 h-5" />
          </button>

          {/* More Options */}
          <button
            onClick={handleOptions}
            className="p-2 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200 hover:scale-110"
            title="More Options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Share Menu */}
      {showShareMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowShareMenu(false)}
          />
          
          {/* Share Menu */}
          <div className="absolute right-4 top-20 bg-white rounded-xl shadow-2xl border border-gray-200 py-3 z-50 min-w-[220px] animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-green-500" />
                <span>Share Post</span>
              </h3>
            </div>
            
            <div className="py-2">
              <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Copy className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Copy Link</span>
              </button>
              
              <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Star className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium">Share to Story</span>
              </button>
              
              <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Send className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium">Send Message</span>
              </button>
              
              <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <Share2 className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium">Share External</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Options Menu */}
      {showOptionsMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowOptionsMenu(false)}
          />
          
          {/* Options Menu */}
          <div className="absolute right-4 top-20 bg-white rounded-xl shadow-2xl border border-gray-200 py-3 z-50 min-w-[200px] animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Post Options</h3>
            </div>
            
            <div className="py-2">
              <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm font-medium">
                Edit Post
              </button>
              <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm font-medium">
                Hide Post
              </button>
              <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm font-medium">
                Report Post
              </button>
              <button className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm font-medium text-red-600">
                Delete Post
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
