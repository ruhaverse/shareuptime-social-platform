'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdvancedSwapComponent } from '@/components/ui/AdvancedSwapComponent';
import { AdvancedSidebarLayout } from '@/components/ui/AdvancedSidebarLayout';
import { ShareModal } from '@/components/ui/ShareModal';
import { authService } from '@/lib/auth';
import { ShareupCamera } from '@/components/media/ShareupCamera';
import { AdvancedSwapInterface } from '@/components/ui/AdvancedSwapInterface';
import { AdvancedPostActions } from '@/components/ui/AdvancedPostActions';
import { shareupColors } from '@/styles/shareup-colors';

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
  location?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  timeLimit?: number;
}

export default function SwapPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedPostForShare, setSelectedPostForShare] = useState<SwapPost | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock current user
  const currentUser = {
    id: 'current-user',
    firstName: 'Mevcut',
    lastName: 'Kullanıcı',
    profilePicture: '/api/placeholder/64/64'
  };

  const mockSwapPosts: SwapPost[] = [
    {
      id: '1',
      user: {
        id: '1',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        profilePicture: '/api/placeholder/64/64'
      },
      originalImage: '/api/placeholder/400/400',
      swapImage: '/api/placeholder/400/400',
      caption: 'Sunset challenge! Can you recreate this beautiful moment? 🌅',
      location: 'İstanbul, Turkey',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false,
      timeLimit: 24
    },
    {
      id: '2',
      user: {
        id: '2',
        firstName: 'Zeynep',
        lastName: 'Kaya',
        profilePicture: '/api/placeholder/64/64'
      },
      originalImage: '/api/placeholder/400/400',
      caption: 'Coffee art challenge ☕ Show me your latte art skills!',
      location: 'Ankara, Turkey',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      likes: 18,
      comments: 12,
      shares: 5,
      isLiked: true,
      timeLimit: 48
    },
    {
      id: '3',
      user: {
        id: '3',
        firstName: 'Mehmet',
        lastName: 'Demir',
        profilePicture: '/api/placeholder/64/64'
      },
      originalImage: '/api/placeholder/400/400',
      swapImage: '/api/placeholder/400/400',
      caption: 'Street photography challenge 📸 Find your perfect urban shot!',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      likes: 31,
      comments: 15,
      shares: 7,
      isLiked: false,
      timeLimit: 12
    }
  ];

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const userId = await authService.getCurrentUserId();
        if (userId) {
          setIsAuthenticated(true);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // handle image upload
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSwap = (swapData: any) => {
    console.log('Creating swap:', swapData);
    // Here you would implement the actual swap creation logic
  };

  const handleSwapResponse = (postId: string, responseImage: File) => {
    console.log('Swap response for post:', postId, 'with image:', responseImage);
    // Here you would implement the actual swap response logic
  };

  const handleLike = (postId: string) => {
    console.log('Like post:', postId);
    // Here you would implement the actual like logic
  };

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId);
    // Here you would implement the actual comment logic
  };

  const handleShare = (postId: string) => {
    const post = mockSwapPosts.find(p => p.id === postId);
    if (post) {
      setSelectedPostForShare(post);
      setShareModalOpen(true);
    }
  };

  return (
    <AdvancedSidebarLayout user={currentUser}>
      <div className="flex-1 min-h-screen bg-gray-50">
        <AdvancedSwapComponent
          currentUser={currentUser}
          swapPosts={mockSwapPosts}
          onCreateSwap={handleCreateSwap}
          onSwapResponse={handleSwapResponse}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
        />
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
          postTitle={selectedPostForShare.caption}
          postImage={selectedPostForShare.originalImage}
        />
      )}
    </AdvancedSidebarLayout>
  );
}
