'use client';

import React, { useState, useEffect } from 'react';
import { PostCard } from '@/components/ui/ShareupCard';
import { ShareupButton } from '@/components/ui/ShareupButton';
import { ShareupCamera } from '@/components/media/ShareupCamera';
import { StoryRing } from '@/components/media/ShareupStories';
import { EnhancedPostActions } from '@/components/posts/EnhancedPostActions';
import { CreatePostModal } from '@/components/create/CreatePostModal';
import { shareupColors } from '@/styles/shareup-colors';
import { FeedAPI, PostAPI, MediaAPI } from '@/services/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  images?: string[];
  likesCount: number;
  commentsCount: number;
  user: User;
}

interface ShareupFeedProps {
  className?: string;
}

export const ShareupFeed: React.FC<ShareupFeedProps> = ({ className = '' }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  
  // Mock stories data
  const stories = [
    { id: '1', user: { id: '1', firstName: 'Your', lastName: 'Story', profilePicture: '' }, hasUnviewedStories: false },
    { id: '2', user: { id: '2', firstName: 'Ahmet', lastName: 'Yılmaz', profilePicture: '' }, hasUnviewedStories: true },
    { id: '3', user: { id: '3', firstName: 'Zeynep', lastName: 'Kaya', profilePicture: '' }, hasUnviewedStories: true },
    { id: '4', user: { id: '4', firstName: 'Mehmet', lastName: 'Demir', profilePicture: '' }, hasUnviewedStories: false },
  ];

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await FeedAPI.list();
      // Map backend response to local Post shape if needed
      const mapped: Post[] = (data as any[]).map((p: any) => ({
        id: String(p.id ?? p._id ?? ''),
        content: String(p.content ?? ''),
        createdAt: String(p.createdAt ?? new Date().toISOString()),
        images: p.mediaUrl ? [String(p.mediaUrl)] : [],
        likesCount: Number(p.likes ?? p.likesCount ?? 0),
        commentsCount: Number(p.commentsCount ?? 0),
        user: {
          id: String(p.user?.id ?? p.userId ?? ''),
          firstName: String(p.user?.firstName ?? p.user?.name ?? 'User'),
          lastName: String(p.user?.lastName ?? ''),
          profilePicture: p.user?.avatarUrl,
        },
      }));
      setPosts(mapped);
    } catch (error) {
      console.error('Feed loading error:', error);
      setError('Feed yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const handleLike = async (postId: string) => {
    try {
      await PostAPI.like(postId);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likesCount: post.likesCount + 1 }
            : post
        )
      );
    } catch (e) {
      console.error('Like failed', e);
    }
  };

  const handleComment = (postId: string) => {
    // Navigate to comments or open comment modal
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: string) => {
    // Handle share functionality
    console.log('Share post:', postId);
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className={`bg-shareup-lighter-gray h-48 rounded-lg`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-shareup-red/10 border border-shareup-red/20 text-shareup-red text-sm">
          {error}
        </div>
      )}
      {/* Stories Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-shareup-lighter-gray">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {/* Add Story Button */}
          <button
            onClick={() => setShowCamera(true)}
            className="flex flex-col items-center space-y-2 p-2 flex-shrink-0"
          >
            <div className="w-16 h-16 rounded-full bg-shareup-light border-2 border-dashed border-shareup-primary flex items-center justify-center">
              <span className="text-shareup-primary text-2xl">+</span>
            </div>
            <span className="text-xs text-shareup-dark font-medium">Add Story</span>
          </button>

          {/* Story Rings */}
          {stories.map((story) => (
            <StoryRing
              key={story.id}
              user={story.user}
              hasUnviewedStories={story.hasUnviewedStories}
              onClick={() => console.log('Open story:', story.id)}
            />
          ))}
        </div>
      </div>

      {/* Feed Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold text-shareup-dark`}>
          News Feed
        </h2>
        <ShareupButton
          title={refreshing ? 'Refreshing...' : 'Refresh'}
          onPress={handleRefresh}
          variant="secondary"
          size="small"
          loading={refreshing}
        />
      </div>

      {/* Create Post Section */}
      <div className={`
        bg-white rounded-lg shadow-md p-4 mb-6
        border border-shareup-lighter-gray
      `}>
        <div className="flex items-center space-x-3">
          <div className={`
            w-10 h-10 rounded-full 
            bg-shareup-profile 
            flex items-center justify-center
          `}>
            <span className={`text-white font-semibold`}>
              U
            </span>
          </div>
          <button 
            onClick={() => setShowCreatePost(true)}
            className={`
              flex-1 text-left px-4 py-3 
              bg-shareup-light 
              rounded-full
              text-shareup-dim-gray
              hover:bg-opacity-80 transition-colors duration-200
            `}
          >
            What's on your mind?
          </button>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-shareup-lighter-gray">
          <button 
            onClick={() => setShowCamera(true)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg
              text-shareup-dim-gray 
              hover:bg-shareup-light
              transition-colors duration-200
            `}
          >
            <span>📷</span>
            <span>Photo</span>
          </button>
          <button 
            onClick={() => setShowCamera(true)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg
              text-shareup-dim-gray 
              hover:bg-shareup-light
              transition-colors duration-200
            `}
          >
            <span>🎥</span>
            <span>Video</span>
          </button>
          <button className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg
            text-shareup-dim-gray 
            hover:bg-shareup-light
            transition-colors duration-200
          `}>
            <span>😊</span>
            <span>Feeling</span>
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map(post => (
          <PostCard
            key={post.id}
            user={post.user}
            post={post}
            onLike={() => handleLike(post.id)}
            onComment={() => handleComment(post.id)}
            onShare={() => handleShare(post.id)}
          />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <ShareupButton
          title="Load More Posts"
          onPress={() => console.log('Load more')}
          variant="secondary"
          size="medium"
        />
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <ShareupCamera
          onCapture={(file) => {
            console.log('Captured file:', file);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
          title="Create Story"
        />
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onPost={async (content, media) => {
            try {
              let mediaUrl: string | undefined;
              if (media && media.length > 0) {
                // upload first file for now
                const up = await MediaAPI.upload(media[0]);
                mediaUrl = up.fileUrl;
              }
              const created = await PostAPI.create({ content, mediaUrl });
              const newPost: Post = {
                id: String((created as any).id ?? (created as any)._id ?? Date.now()),
                content: created.content,
                createdAt: new Date().toISOString(),
                images: created.mediaUrl ? [created.mediaUrl] : [],
                likesCount: 0,
                commentsCount: 0,
                user: {
                  id: 'current-user',
                  firstName: 'You',
                  lastName: '',
                }
              };
              setPosts(prev => [newPost, ...prev]);
            } catch (e) {
              console.error('Post create failed', e);
            }
          }}
        />
      )}
    </div>
  );
};
