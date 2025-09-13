'use client';

import React, { useState, useEffect } from 'react';
import { ShareupStories } from '@/components/media/ShareupStories';
import { ShareupLayout } from '@/components/layout/ShareupLayout';

interface Story {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  timestamp: string;
  isViewed: boolean;
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mock stories data
  const mockStories: Story[] = [
    {
      id: '1',
      mediaUrl: '/api/placeholder/image/1.jpg',
      mediaType: 'image',
      duration: 5000,
      user: {
        id: '1',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
      },
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isViewed: false,
    },
    {
      id: '2',
      mediaUrl: '/api/placeholder/video/story1.mp4',
      mediaType: 'video',
      duration: 15000,
      user: {
        id: '2',
        firstName: 'Zeynep',
        lastName: 'Kaya',
      },
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      isViewed: false,
    },
    {
      id: '3',
      mediaUrl: '/api/placeholder/image/2.jpg',
      mediaType: 'image',
      duration: 5000,
      user: {
        id: '3',
        firstName: 'Mehmet',
        lastName: 'Demir',
      },
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      isViewed: true,
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStories(mockStories);
      setLoading(false);
    }, 1000);
  }, []);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Navigate back to feed or close stories
      window.history.back();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleClose = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <ShareupLayout currentPath="/stories" showMobileNav={false}>
      <ShareupStories
        stories={stories}
        currentStoryIndex={currentIndex}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onClose={handleClose}
      />
    </ShareupLayout>
  );
}
