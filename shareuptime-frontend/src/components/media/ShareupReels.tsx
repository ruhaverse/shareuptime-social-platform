'use client';

import React, { useState, useRef } from 'react';
import { shareupColors } from '@/styles/shareup-colors';

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

interface ShareupReelsProps {
  reels: Reel[];
  onLike: (reelId: string) => void;
  onComment: (reelId: string) => void;
  onShare: (reelId: string) => void;
  onFollow: (userId: string) => void;
}

export const ShareupReels: React.FC<ShareupReelsProps> = ({
  reels,
  onLike,
  onComment,
  onShare,
  onFollow
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleVideoClick = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleScroll = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'down' && currentIndex < reels.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Reels Container */}
      <div 
        className="flex flex-col transition-transform duration-300 ease-out"
        style={{ transform: `translateY(-${currentIndex * 100}vh)` }}
      >
        {reels.map((reel, index) => (
          <div key={reel.id} className="relative w-full h-screen flex-shrink-0">
            {/* Video */}
            <video
              ref={(el) => { videoRefs.current[index] = el; }}
              src={reel.videoUrl}
              className="w-full h-full object-cover"
              loop
              muted
              autoPlay={index === currentIndex}
              onClick={() => handleVideoClick(index)}
            />

            {/* Play/Pause Overlay */}
            {!isPlaying && index === currentIndex && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => handleVideoClick(index)}
                  className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-3xl ml-1">▶️</span>
                </button>
              </div>
            )}

            {/* User Info Overlay */}
            <div className="absolute bottom-20 left-4 right-20 text-white">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 rounded-full bg-shareup-profile flex items-center justify-center mr-3">
                  {reel.user.profilePicture ? (
                    <img 
                      src={reel.user.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold">
                      {reel.user.firstName[0]}{reel.user.lastName[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">
                    {reel.user.firstName} {reel.user.lastName}
                  </p>
                </div>
                <button
                  onClick={() => onFollow(reel.user.id)}
                  className="bg-shareup-primary px-4 py-2 rounded-full text-sm font-semibold"
                >
                  Follow
                </button>
              </div>
              
              {reel.caption && (
                <p className="text-white/90 leading-relaxed mb-2">
                  {reel.caption}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-20 right-4 flex flex-col items-center space-y-6">
              {/* Like Button */}
              <button
                onClick={() => onLike(reel.id)}
                className="flex flex-col items-center"
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${reel.isLiked ? 'bg-red-500' : 'bg-black/30'}
                  transition-colors duration-200
                `}>
                  <span className="text-white text-xl">
                    {reel.isLiked ? '❤️' : '🤍'}
                  </span>
                </div>
                <span className="text-white text-xs mt-1 font-medium">
                  {formatNumber(reel.likes)}
                </span>
              </button>

              {/* Comment Button */}
              <button
                onClick={() => onComment(reel.id)}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-black/30 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">💬</span>
                </div>
                <span className="text-white text-xs mt-1 font-medium">
                  {formatNumber(reel.comments)}
                </span>
              </button>

              {/* Share Button */}
              <button
                onClick={() => onShare(reel.id)}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-black/30 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">📤</span>
                </div>
                <span className="text-white text-xs mt-1 font-medium">
                  {formatNumber(reel.shares)}
                </span>
              </button>

              {/* More Options */}
              <button className="flex flex-col items-center">
                <div className="w-12 h-12 bg-black/30 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">⋯</span>
                </div>
              </button>
            </div>

            {/* Navigation Arrows */}
            {currentIndex > 0 && (
              <button
                onClick={() => handleScroll('up')}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-black/30 rounded-full p-2"
              >
                <span className="text-white text-xl">↑</span>
              </button>
            )}

            {currentIndex < reels.length - 1 && (
              <button
                onClick={() => handleScroll('down')}
                className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-full bg-black/30 rounded-full p-2"
              >
                <span className="text-white text-xl">↓</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Progress Indicators */}
      <div className="absolute top-4 right-4 flex flex-col space-y-1">
        {reels.map((_, index) => (
          <div
            key={index}
            className={`
              w-1 h-8 rounded-full transition-colors duration-200
              ${index === currentIndex ? 'bg-white' : 'bg-white/30'}
            `}
          />
        ))}
      </div>

      {/* Close Button */}
      <button
        onClick={() => window.history.back()}
        className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center"
      >
        <span className="text-white text-xl">✕</span>
      </button>
    </div>
  );
};
