'use client';

import React, { useState, useEffect } from 'react';
import { ShareupLayout } from '@/components/layout/ShareupLayout';
import { ShareupButton } from '@/components/ui/ShareupButton';
import { ShareupCard } from '@/components/ui/ShareupCard';
import { shareupColors } from '@/styles/shareup-colors';

interface TrendingTopic {
  id: string;
  hashtag: string;
  posts: number;
  growth: number;
}

interface SuggestedUser {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  mutualFriends: number;
  isFollowing: boolean;
}

export default function ExplorePage() {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'trending' | 'people' | 'posts'>('trending');

  // Mock data
  const mockTrending: TrendingTopic[] = [
    { id: '1', hashtag: '#ShareUpTime', posts: 12500, growth: 25 },
    { id: '2', hashtag: '#SosyalMedya', posts: 8900, growth: 18 },
    { id: '3', hashtag: '#Teknoloji', posts: 15600, growth: 12 },
    { id: '4', hashtag: '#Yenilik', posts: 6700, growth: 35 },
    { id: '5', hashtag: '#Gelecek', posts: 4300, growth: 28 },
  ];

  const mockUsers: SuggestedUser[] = [
    { id: '1', firstName: 'Ayşe', lastName: 'Yılmaz', mutualFriends: 12, isFollowing: false },
    { id: '2', firstName: 'Mehmet', lastName: 'Kaya', mutualFriends: 8, isFollowing: false },
    { id: '3', firstName: 'Zeynep', lastName: 'Demir', mutualFriends: 15, isFollowing: true },
    { id: '4', firstName: 'Ali', lastName: 'Özkan', mutualFriends: 6, isFollowing: false },
  ];

  useEffect(() => {
    setTrendingTopics(mockTrending);
    setSuggestedUsers(mockUsers);
  }, []);

  const handleFollow = (userId: string) => {
    setSuggestedUsers(prev =>
      prev.map(user =>
        user.id === userId
          ? { ...user, isFollowing: !user.isFollowing }
          : user
      )
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <ShareupLayout currentPath="/explore">
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-shareup-dark mb-4">Explore</h1>
            
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search people, hashtags, posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-white border border-shareup-lighter-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-shareup-primary focus:border-transparent"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-shareup-gray text-xl">
                🔍
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 border border-shareup-lighter-gray">
            {[
              { key: 'trending', label: 'Trending', icon: '🔥' },
              { key: 'people', label: 'People', icon: '👥' },
              { key: 'posts', label: 'Posts', icon: '📝' },
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
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === 'trending' && (
            <div className="space-y-4">
              <ShareupCard>
                <h2 className="text-lg font-semibold text-shareup-dark mb-4">
                  🔥 Trending Topics
                </h2>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div key={topic.id} className="flex items-center justify-between p-3 hover:bg-shareup-light rounded-lg transition-colors duration-200">
                      <div className="flex items-center space-x-4">
                        <span className="text-shareup-gray font-medium text-sm">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-shareup-dark">
                            {topic.hashtag}
                          </p>
                          <p className="text-sm text-shareup-gray">
                            {formatNumber(topic.posts)} posts
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-shareup-active-green font-medium">
                          +{topic.growth}%
                        </span>
                        <span className="text-shareup-active-green">📈</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ShareupCard>

              {/* Quick Actions */}
              <ShareupCard>
                <h3 className="text-lg font-semibold text-shareup-dark mb-4">
                  Quick Discover
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium hover:shadow-lg transition-all duration-200">
                    <span className="block text-2xl mb-2">🎬</span>
                    Reels
                  </button>
                  <button className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white font-medium hover:shadow-lg transition-all duration-200">
                    <span className="block text-2xl mb-2">📱</span>
                    Stories
                  </button>
                  <button className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white font-medium hover:shadow-lg transition-all duration-200">
                    <span className="block text-2xl mb-2">🎵</span>
                    Music
                  </button>
                  <button className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white font-medium hover:shadow-lg transition-all duration-200">
                    <span className="block text-2xl mb-2">🔴</span>
                    Live
                  </button>
                </div>
              </ShareupCard>
            </div>
          )}

          {activeTab === 'people' && (
            <ShareupCard>
              <h2 className="text-lg font-semibold text-shareup-dark mb-4">
                👥 Suggested People
              </h2>
              <div className="space-y-4">
                {suggestedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 hover:bg-shareup-light rounded-lg transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-shareup-profile flex items-center justify-center">
                        {user.profilePicture ? (
                          <img 
                            src={user.profilePicture} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-shareup-dark">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-shareup-gray">
                          {user.mutualFriends} mutual friends
                        </p>
                      </div>
                    </div>
                    <ShareupButton
                      title={user.isFollowing ? 'Following' : 'Follow'}
                      onPress={() => handleFollow(user.id)}
                      variant={user.isFollowing ? 'secondary' : 'primary'}
                      size="small"
                    />
                  </div>
                ))}
              </div>
            </ShareupCard>
          )}

          {activeTab === 'posts' && (
            <ShareupCard>
              <h2 className="text-lg font-semibold text-shareup-dark mb-4">
                📝 Discover Posts
              </h2>
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🔍</span>
                <p className="text-shareup-gray mb-4">
                  Search for posts using hashtags or keywords
                </p>
                <p className="text-sm text-shareup-dim-gray">
                  Try searching for #ShareUpTime, #Technology, or other topics
                </p>
              </div>
            </ShareupCard>
          )}
        </div>
      </div>
    </ShareupLayout>
  );
}
