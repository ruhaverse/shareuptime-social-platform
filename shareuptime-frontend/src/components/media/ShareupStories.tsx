'use client';

import React, { useState, useRef, useEffect } from 'react';
import { shareupColors } from '@/styles/shareup-colors';

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

interface ShareupStoriesProps {
  stories: Story[];
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentStoryIndex: number;
}

export const ShareupStories: React.FC<ShareupStoriesProps> = ({
  stories,
  onClose,
  onNext,
  onPrevious,
  currentStoryIndex
}) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentStory = stories[currentStoryIndex];
  const duration = currentStory?.duration || 5000; // Default 5 seconds

  useEffect(() => {
    setProgress(0);
    startProgress();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentStoryIndex]);

  const startProgress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const increment = 100 / (duration / 100);
    
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          onNext();
          return 0;
        }
        return prev + increment;
      });
    }, 100);
  };

  const pauseProgress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPaused(true);
    
    if (videoRef.current && currentStory.mediaType === 'video') {
      videoRef.current.pause();
    }
  };

  const resumeProgress = () => {
    setIsPaused(false);
    startProgress();
    
    if (videoRef.current && currentStory.mediaType === 'video') {
      videoRef.current.play();
    }
  };

  const handleTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const width = rect.width;
    
    if (tapX < width / 3) {
      onPrevious();
    } else if (tapX > (2 * width) / 3) {
      onNext();
    } else {
      if (isPaused) {
        resumeProgress();
      } else {
        pauseProgress();
      }
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Progress Bars */}
      <div className="flex space-x-1 p-2">
        {stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width: index < currentStoryIndex ? '100%' : 
                       index === currentStoryIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-shareup-profile flex items-center justify-center">
            {currentStory.user.profilePicture ? (
              <img 
                src={currentStory.user.profilePicture} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-sm">
                {currentStory.user.firstName[0]}{currentStory.user.lastName[0]}
              </span>
            )}
          </div>
          <div>
            <p className="text-white font-semibold">
              {currentStory.user.firstName} {currentStory.user.lastName}
            </p>
            <p className="text-white/70 text-sm">
              {new Date(currentStory.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <span className="text-2xl">✕</span>
        </button>
      </div>

      {/* Story Content */}
      <div 
        className="flex-1 relative cursor-pointer"
        onClick={handleTap}
      >
        {currentStory.mediaType === 'image' ? (
          <img
            src={currentStory.mediaUrl}
            alt="Story"
            className="w-full h-full object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            src={currentStory.mediaUrl}
            className="w-full h-full object-contain"
            autoPlay
            muted
            loop={false}
            onEnded={onNext}
          />
        )}

        {/* Pause Indicator */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl ml-1">▶️</span>
            </div>
          </div>
        )}

        {/* Navigation Hints */}
        <div className="absolute inset-0 flex">
          <div className="flex-1" /> {/* Left tap area */}
          <div className="flex-1" /> {/* Center tap area */}
          <div className="flex-1" /> {/* Right tap area */}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 flex items-center space-x-4">
        <div className="flex-1 bg-white/10 rounded-full px-4 py-2">
          <input
            type="text"
            placeholder="Reply to story..."
            className="w-full bg-transparent text-white placeholder-white/70 outline-none"
          />
        </div>
        <button className="text-white hover:text-gray-300 transition-colors">
          <span className="text-2xl">❤️</span>
        </button>
        <button className="text-white hover:text-gray-300 transition-colors">
          <span className="text-2xl">📤</span>
        </button>
      </div>
    </div>
  );
};

// Story Ring Component for Feed
interface StoryRingProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  hasUnviewedStories: boolean;
  onClick: () => void;
}

export const StoryRing: React.FC<StoryRingProps> = ({
  user,
  hasUnviewedStories,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center space-y-2 p-2"
    >
      <div className={`
        w-16 h-16 rounded-full p-0.5
        ${hasUnviewedStories 
          ? 'bg-gradient-to-tr from-purple-500 to-pink-500' 
          : 'bg-gray-300'
        }
      `}>
        <div className="w-full h-full rounded-full bg-white p-0.5">
          <div className="w-full h-full rounded-full bg-shareup-profile flex items-center justify-center overflow-hidden">
            {user.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-sm">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            )}
          </div>
        </div>
      </div>
      <span className="text-xs text-shareup-dark font-medium max-w-16 truncate">
        {user.firstName}
      </span>
    </button>
  );
};
