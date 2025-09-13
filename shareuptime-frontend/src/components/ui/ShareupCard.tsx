import React from 'react';
import { shareupColors } from '@/styles/shareup-colors';

interface ShareupCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  shadow?: boolean;
  rounded?: boolean;
}

export const ShareupCard: React.FC<ShareupCardProps> = ({
  children,
  className = '',
  padding = 'medium',
  shadow = true,
  rounded = true,
}) => {
  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'small':
        return 'p-3';
      case 'medium':
        return 'p-6';
      case 'large':
        return 'p-8';
      default:
        return 'p-6';
    }
  };

  return (
    <div
      className={`
        bg-white
        ${rounded ? 'rounded-lg' : ''}
        ${shadow ? 'shadow-md hover:shadow-lg' : ''}
        ${getPaddingStyles()}
        transition-all duration-200
        border border-[${shareupColors.lighterGray}]
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Post Card Component - Adapted from Mobile App
interface PostCardProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  post: {
    id: string;
    content: string;
    createdAt: string;
    images?: string[];
    likesCount: number;
    commentsCount: number;
  };
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  user,
  post,
  onLike,
  onComment,
  onShare,
}) => {
  return (
    <ShareupCard className="mb-4">
      {/* User Info Header */}
      <div className="flex items-center mb-4">
        <div 
          className={`
            w-12 h-12 rounded-full 
            bg-[${shareupColors.profilePicture}] 
            flex items-center justify-center
            mr-3
          `}
        >
          {user.profilePicture ? (
            <img 
              src={user.profilePicture} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className={`text-[${shareupColors.white}] font-semibold`}>
              {user.firstName[0]}{user.lastName[0]}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold text-[${shareupColors.dark}]`}>
            {user.firstName} {user.lastName}
          </h3>
          <p className={`text-sm text-[${shareupColors.dimGray}]`}>
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button className={`text-[${shareupColors.dimGray}] hover:text-[${shareupColors.dark}]`}>
          ⋯
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className={`text-[${shareupColors.dark}] leading-relaxed`}>
          {post.content}
        </p>
      </div>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="mb-4">
          <img 
            src={post.images[0]} 
            alt="Post content" 
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-[${shareupColors.lighterGray}]">
        <div className="flex items-center space-x-6">
          <button 
            onClick={onLike}
            className={`
              flex items-center space-x-2 
              text-[${shareupColors.dimGray}] 
              hover:text-[${shareupColors.activeGreen}]
              transition-colors duration-200
            `}
          >
            <span>👍</span>
            <span className="text-sm font-medium">{post.likesCount}</span>
          </button>
          
          <button 
            onClick={onComment}
            className={`
              flex items-center space-x-2 
              text-[${shareupColors.dimGray}] 
              hover:text-[${shareupColors.iondigoDye}]
              transition-colors duration-200
            `}
          >
            <span>💬</span>
            <span className="text-sm font-medium">{post.commentsCount}</span>
          </button>
          
          <button 
            onClick={onShare}
            className={`
              flex items-center space-x-2 
              text-[${shareupColors.dimGray}] 
              hover:text-[${shareupColors.iondigoDye}]
              transition-colors duration-200
            `}
          >
            <span>📤</span>
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>
    </ShareupCard>
  );
};
