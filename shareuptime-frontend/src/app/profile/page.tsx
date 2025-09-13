'use client';

import React, { useState, useEffect } from 'react';
import { ShareupLayout } from '@/components/layout/ShareupLayout';
import { ShareupButton } from '@/components/ui/ShareupButton';
import { ShareupCard } from '@/components/ui/ShareupCard';
import { PostCard } from '@/components/ui/ShareupCard';
import { ShareModal } from '@/components/ui/ShareModal';
import { shareupColors } from '@/styles/shareup-colors';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  bio: string;
  profilePicture?: string;
  coverPhoto?: string;
  followers: number;
  following: number;
  posts: number;
  isVerified: boolean;
  joinDate: string;
}

interface UserPost {
  id: string;
  content: string;
  createdAt: string;
  images?: string[];
  likesCount: number;
  commentsCount: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'likes'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedPostForShare, setSelectedPostForShare] = useState<UserPost | null>(null);

  // Mock profile data
  const mockProfile: UserProfile = {
    id: 'current-user',
    firstName: 'Your',
    lastName: 'Name',
    username: '@yourname',
    bio: 'ShareUpTime kullanıcısı 🚀 Teknoloji ve sosyal medya tutkunu 💻 #ShareUpTime',
    followers: 1250,
    following: 890,
    posts: 156,
    isVerified: true,
    joinDate: '2024-01-15',
  };

  const mockPosts: UserPost[] = [
    {
      id: '1',
      content: 'ShareUpTime ile harika deneyimler yaşıyorum! 🎉',
      createdAt: new Date().toISOString(),
      images: [],
      likesCount: 45,
      commentsCount: 12,
    },
    {
      id: '2',
      content: 'Yeni özellikler gerçekten etkileyici. Sosyal medyanın geleceği burada! 🚀',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      images: [],
      likesCount: 78,
      commentsCount: 23,
    },
  ];

  useEffect(() => {
    setProfile(mockProfile);
    setPosts(mockPosts);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const handleShare = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPostForShare(post);
      setShareModalOpen(true);
    }
  };

  if (!profile) {
    return (
      <ShareupLayout currentPath="/profile">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shareup-primary"></div>
        </div>
      </ShareupLayout>
    );
  }

  return (
    <ShareupLayout currentPath="/profile">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {/* Cover Photo */}
          <div className="relative h-64 bg-gradient-to-r from-shareup-gradient-start to-shareup-gradient-end">
            {profile.coverPhoto && (
              <img 
                src={profile.coverPhoto} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            )}
            <button className="absolute top-4 right-4 bg-black/50 text-white px-3 py-2 rounded-lg hover:bg-black/70 transition-colors">
              📷 Edit Cover
            </button>
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Profile Picture */}
            <div className="absolute -top-16 left-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-shareup-profile border-4 border-white flex items-center justify-center shadow-lg">
                  {profile.profilePicture ? (
                    <img 
                      src={profile.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-3xl">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </span>
                  )}
                </div>
                <button className="absolute bottom-2 right-2 bg-shareup-primary text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors">
                  📷
                </button>
              </div>
            </div>

            {/* Profile Details */}
            <div className="pt-20">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h1 className="text-2xl font-bold text-shareup-dark">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    {profile.isVerified && (
                      <span className="text-blue-500 text-xl">✓</span>
                    )}
                  </div>
                  <p className="text-shareup-gray mb-2">{profile.username}</p>
                  <p className="text-shareup-dark mb-4 max-w-md">{profile.bio}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="text-center">
                      <p className="font-bold text-shareup-dark">{formatNumber(profile.posts)}</p>
                      <p className="text-sm text-shareup-gray">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-shareup-dark">{formatNumber(profile.followers)}</p>
                      <p className="text-sm text-shareup-gray">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-shareup-dark">{formatNumber(profile.following)}</p>
                      <p className="text-sm text-shareup-gray">Following</p>
                    </div>
                  </div>

                  <p className="text-sm text-shareup-gray flex items-center">
                    <span className="mr-2">📅</span>
                    Joined {formatJoinDate(profile.joinDate)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mt-4 md:mt-0">
                  <ShareupButton
                    title="Edit Profile"
                    onPress={() => setIsEditing(true)}
                    variant="secondary"
                    size="medium"
                  />
                  <ShareupButton
                    title="Share Profile"
                    onPress={() => console.log('Share profile')}
                    variant="primary"
                    size="medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="px-6">
            <div className="flex space-x-1 bg-white rounded-lg p-1 border border-shareup-lighter-gray mb-6">
              {[
                { key: 'posts', label: 'Posts', icon: '📝', count: profile.posts },
                { key: 'media', label: 'Media', icon: '📷', count: 45 },
                { key: 'likes', label: 'Likes', icon: '❤️', count: 234 },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`
                    flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200
                    ${activeTab === tab.key
                      ? 'bg-shareup-primary text-white shadow-sm'
                      : 'text-shareup-gray hover:bg-shareup-light'
                    }
                  `}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-shareup-light'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="pb-6">
              {activeTab === 'posts' && (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      user={{
                        id: profile.id,
                        firstName: profile.firstName,
                        lastName: profile.lastName,
                        profilePicture: profile.profilePicture,
                      }}
                      post={{
                        id: post.id,
                        content: post.content,
                        createdAt: post.createdAt,
                        images: post.images,
                        likesCount: post.likesCount,
                        commentsCount: post.commentsCount,
                      }}
                      onLike={() => console.log('Like post:', post.id)}
                      onComment={() => console.log('Comment on post:', post.id)}
                      onShare={() => handleShare(post.id)}
                    />
                  ))}
                </div>
              )}

              {activeTab === 'media' && (
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: 9 }, (_, i) => (
                    <div key={i} className="aspect-square bg-shareup-light rounded-lg flex items-center justify-center">
                      <span className="text-shareup-gray text-2xl">📷</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'likes' && (
                <ShareupCard className="text-center py-12">
                  <span className="text-6xl mb-4 block">❤️</span>
                  <h3 className="text-lg font-semibold text-shareup-dark mb-2">
                    Liked Posts
                  </h3>
                  <p className="text-shareup-gray">
                    Posts you've liked will appear here
                  </p>
                </ShareupCard>
              )}
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {selectedPostForShare && (
          <ShareModal
            isOpen={shareModalOpen}
            onClose={() => {
              setShareModalOpen(false);
              setSelectedPostForShare(null);
            }}
            postId={selectedPostForShare.id}
            postTitle={selectedPostForShare.content}
            postImage={selectedPostForShare.images?.[0]}
          />
        )}
      </div>
    </ShareupLayout>
  );
}
