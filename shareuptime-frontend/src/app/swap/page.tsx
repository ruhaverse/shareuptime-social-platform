'use client';

import React, { useState, useRef } from 'react';
import { ShareupLayout } from '@/components/layout/ShareupLayout';
import { ShareupButton } from '@/components/ui/ShareupButton';
import { ShareupCard } from '@/components/ui/ShareupCard';
import { ShareupCamera } from '@/components/media/ShareupCamera';
import { shareupColors } from '@/styles/shareup-colors';
import { useRouter } from 'next/navigation';

interface SwapPost {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  originalImage: string;
  swapImage?: string;
  caption: string;
  createdAt: string;
  likesCount: number;
  swapsCount: number;
}

export default function SwapPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [swapPosts, setSwapPosts] = useState<SwapPost[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'feed'>('create');

  // Mock swap posts
  const mockSwapPosts: SwapPost[] = [
    {
      id: '1',
      user: {
        id: '1',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
      },
      originalImage: '/api/placeholder/300/400',
      swapImage: '/api/placeholder/300/400',
      caption: 'Swap challenge! Can you do better? 📸',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      likesCount: 45,
      swapsCount: 12,
    },
    {
      id: '2',
      user: {
        id: '2',
        firstName: 'Zeynep',
        lastName: 'Kaya',
      },
      originalImage: '/api/placeholder/300/400',
      caption: 'Original photo - waiting for swaps! 🎯',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      likesCount: 23,
      swapsCount: 8,
    },
  ];

  React.useEffect(() => {
    setSwapPosts(mockSwapPosts);
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setShowCamera(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateSwap = () => {
    if (!selectedImage) return;

    const newSwapPost: SwapPost = {
      id: Date.now().toString(),
      user: {
        id: 'current-user',
        firstName: 'Your',
        lastName: 'Name',
      },
      originalImage: selectedImage,
      caption: 'New swap challenge! 🔥',
      createdAt: new Date().toISOString(),
      likesCount: 0,
      swapsCount: 0,
    };

    setSwapPosts(prev => [newSwapPost, ...prev]);
    setSelectedImage(null);
    setActiveTab('feed');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  const SwapPostCard = ({ post }: { post: SwapPost }) => (
    <ShareupCard padding="none" className="hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        {/* Images */}
        <div className="grid grid-cols-2 gap-1">
          <div className="relative aspect-square">
            <img 
              src={post.originalImage} 
              alt="Original" 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
              Original
            </div>
          </div>
          {post.swapImage ? (
            <div className="relative aspect-square">
              <img 
                src={post.swapImage} 
                alt="Swap" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-shareup-primary text-white px-2 py-1 rounded-full text-xs">
                Swap
              </div>
            </div>
          ) : (
            <div className="aspect-square bg-shareup-light flex items-center justify-center">
              <div className="text-center">
                <span className="text-4xl mb-2 block">📷</span>
                <p className="text-shareup-gray text-sm">Waiting for swap</p>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-shareup-profile flex items-center justify-center">
              {post.user.profilePicture ? (
                <img 
                  src={post.user.profilePicture} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-sm">
                  {post.user.firstName[0]}{post.user.lastName[0]}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-shareup-dark">
                {post.user.firstName} {post.user.lastName}
              </h4>
              <p className="text-xs text-shareup-gray">{formatTime(post.createdAt)}</p>
            </div>
          </div>

          <p className="text-shareup-dark mb-3">{post.caption}</p>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-shareup-gray mb-3">
            <div className="flex items-center space-x-4">
              <span>❤️ {post.likesCount}</span>
              <span>🔄 {post.swapsCount} swaps</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <ShareupButton
              title="❤️ Like"
              onPress={() => console.log('Like swap:', post.id)}
              variant="secondary"
              size="small"
              fullWidth
            />
            <ShareupButton
              title="🔄 Swap"
              onPress={() => router.push(`/swap/${post.id}`)}
              variant="primary"
              size="small"
              fullWidth
            />
          </div>
        </div>
      </div>
    </ShareupCard>
  );

  return (
    <ShareupLayout currentPath="/swap">
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-shareup-dark mb-2">Swap Challenge</h1>
            <p className="text-shareup-gray">Share photos and challenge others to recreate them</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-white rounded-lg p-1 border border-shareup-lighter-gray mb-6">
            {[
              { key: 'create', label: 'Create Swap', icon: '📷' },
              { key: 'feed', label: 'Swap Feed', icon: '🔄' },
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

          {/* Create Swap Tab */}
          {activeTab === 'create' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Section */}
              <ShareupCard>
                <h3 className="text-lg font-semibold text-shareup-dark mb-4">Create New Swap</h3>
                
                {selectedImage ? (
                  <div className="relative mb-4">
                    <img 
                      src={selectedImage} 
                      alt="Selected" 
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-shareup-lighter-gray rounded-lg p-8 text-center mb-4">
                    <span className="text-6xl mb-4 block">📷</span>
                    <h4 className="font-semibold text-shareup-dark mb-2">Upload Your Photo</h4>
                    <p className="text-shareup-gray mb-4">Choose a photo to start a swap challenge</p>
                    
                    <div className="flex flex-col space-y-2">
                      <ShareupButton
                        title="📁 Choose from Gallery"
                        onPress={() => fileInputRef.current?.click()}
                        variant="primary"
                        size="medium"
                        fullWidth
                      />
                      <ShareupButton
                        title="📷 Take Photo"
                        onPress={() => setShowCamera(true)}
                        variant="secondary"
                        size="medium"
                        fullWidth
                      />
                    </div>
                  </div>
                )}

                {selectedImage && (
                  <ShareupButton
                    title="🚀 Create Swap Challenge"
                    onPress={handleCreateSwap}
                    variant="primary"
                    size="large"
                    fullWidth
                  />
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </ShareupCard>

              {/* Instructions */}
              <ShareupCard>
                <h3 className="text-lg font-semibold text-shareup-dark mb-4">How Swap Works</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-shareup-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-shareup-dark">Upload Original</h4>
                      <p className="text-shareup-gray text-sm">Share a photo you want others to recreate</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-shareup-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-shareup-dark">Get Swaps</h4>
                      <p className="text-shareup-gray text-sm">Others will try to recreate your photo</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-shareup-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-shareup-dark">Compare & Vote</h4>
                      <p className="text-shareup-gray text-sm">See side-by-side comparisons and vote for the best</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-shareup-light rounded-lg">
                  <h4 className="font-semibold text-shareup-dark mb-2">💡 Tips for Great Swaps</h4>
                  <ul className="text-sm text-shareup-gray space-y-1">
                    <li>• Use good lighting</li>
                    <li>• Choose interesting poses or scenes</li>
                    <li>• Make it challenging but achievable</li>
                    <li>• Add creative elements</li>
                  </ul>
                </div>
              </ShareupCard>
            </div>
          )}

          {/* Feed Tab */}
          {activeTab === 'feed' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {swapPosts.length > 0 ? (
                swapPosts.map((post) => (
                  <SwapPostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="col-span-full">
                  <ShareupCard className="text-center py-12">
                    <span className="text-6xl mb-4 block">🔄</span>
                    <h3 className="text-lg font-semibold text-shareup-dark mb-2">
                      No swap challenges yet
                    </h3>
                    <p className="text-shareup-gray mb-4">
                      Be the first to create a swap challenge
                    </p>
                    <ShareupButton
                      title="Create First Swap"
                      onPress={() => setActiveTab('create')}
                      variant="primary"
                      size="medium"
                    />
                  </ShareupCard>
                </div>
              )}
            </div>
          )}

          {/* Camera Modal */}
          {showCamera && (
            <ShareupCamera
              onCapture={handleCameraCapture}
              onClose={() => setShowCamera(false)}
              mode="photo"
              title="Take Swap Photo"
            />
          )}
        </div>
      </div>
    </ShareupLayout>
  );
}
