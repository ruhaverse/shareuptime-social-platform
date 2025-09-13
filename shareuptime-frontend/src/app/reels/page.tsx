'use client';

import React, { useState, useEffect } from 'react';
import { ShareupReels } from '@/components/media/ShareupReels';
import { ShareupLayout } from '@/components/layout/ShareupLayout';
import { AdvancedCameraControls } from '@/components/ui/AdvancedCameraControls';
import { Plus } from 'lucide-react';

interface Reel {
  id: string;
  videoUrl: string;
  caption: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
}

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);

  // Mock reels data
  const mockReels: Reel[] = [
    {
      id: '1',
      videoUrl: '/api/placeholder/video/1.mp4',
      caption: 'ShareUpTime ile harika anlar! 🎉 #ShareUpTime #SosyalMedya',
      user: {
        id: '1',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
      },
      likes: 1250,
      comments: 89,
      shares: 45,
      isLiked: false,
    },
    {
      id: '2',
      videoUrl: '/api/placeholder/video/2.mp4',
      caption: 'Yeni özelliklerimizi keşfedin! 🚀 Gerçek zamanlı deneyim burada.',
      user: {
        id: '2',
        firstName: 'Zeynep',
        lastName: 'Kaya',
      },
      likes: 2340,
      comments: 156,
      shares: 78,
      isLiked: true,
    },
    {
      id: '3',
      videoUrl: '/api/placeholder/video/3.mp4',
      caption: 'Arkadaşlarınızla bağlantı kurun! 👥 #Friendship #Connection',
      user: {
        id: '3',
        firstName: 'Mehmet',
        lastName: 'Demir',
      },
      likes: 890,
      comments: 67,
      shares: 23,
      isLiked: false,
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReels(mockReels);
      setLoading(false);
    }, 1000);
  }, []);

  const handleLike = (reelId: string) => {
    setReels(prevReels =>
      prevReels.map(reel =>
        reel.id === reelId
          ? {
              ...reel,
              isLiked: !reel.isLiked,
              likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1,
            }
          : reel
      )
    );
  };

  const handleComment = (reelId: string) => {
    console.log('Open comments for reel:', reelId);
    // Navigate to comments or open comment modal
  };

  const handleShare = (reelId: string) => {
    console.log('Share reel:', reelId);
    // Handle share functionality
  };

  const handleFollow = (userId: string) => {
    console.log('Follow user:', userId);
    // Handle follow functionality
  };

  const handleCreateReel = (file: File) => {
    // Handle reel creation
    console.log('Creating reel with file:', file.name);
    
    // Create new reel object
    const newReel: Reel = {
      id: Date.now().toString(),
      videoUrl: URL.createObjectURL(file),
      caption: 'New reel created with advanced camera! 🎬',
      user: {
        id: 'current-user',
        firstName: 'Your',
        lastName: 'Name',
      },
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
    };
    
    setReels(prev => [newReel, ...prev]);
    setShowCamera(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <>
      <ShareupLayout currentPath="/reels" showMobileNav={false}>
        <div className="relative">
          <ShareupReels
            reels={reels}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onFollow={handleFollow}
          />
          
          {/* Create Reel Button */}
          <button
            onClick={() => setShowCamera(true)}
            className="fixed bottom-20 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-40"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        </div>
      </ShareupLayout>
      
      {/* Advanced Camera for Reel Creation */}
      {showCamera && (
        <AdvancedCameraControls
          mode="video"
          title="Create Reel"
          onCapture={handleCreateReel}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
}
