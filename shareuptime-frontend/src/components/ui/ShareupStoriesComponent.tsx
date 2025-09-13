'use client';

import React, { useState, useEffect } from 'react';
import { shareupColors } from '@/styles/shareup-colors';

interface Story {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  image: string;
  video?: string;
  createdAt: string;
  isViewed: boolean;
}

interface ShareupStoriesComponentProps {
  stories: Story[];
  onStoryView: (storyId: string) => void;
  onCreateStory: () => void;
}

export const ShareupStoriesComponent: React.FC<ShareupStoriesComponentProps> = ({
  stories,
  onStoryView,
  onCreateStory
}) => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleStoryClick = (story: Story, index: number) => {
    setSelectedStory(story);
    setCurrentIndex(index);
    onStoryView(story.id);
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      const nextStory = stories[currentIndex + 1];
      setSelectedStory(nextStory);
      setCurrentIndex(currentIndex + 1);
      onStoryView(nextStory.id);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevStory = stories[currentIndex - 1];
      setSelectedStory(prevStory);
      setCurrentIndex(currentIndex - 1);
      onStoryView(prevStory.id);
    }
  };

  const closeStoryViewer = () => {
    setSelectedStory(null);
  };

  return (
    <>
      {/* Stories Horizontal Scroll */}
      <div className="flex space-x-4 p-4 overflow-x-auto scrollbar-hide">
        {/* Create Story Button */}
        <div 
          onClick={onCreateStory}
          className="flex-shrink-0 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-shareup-gradient-start to-shareup-gradient-end flex items-center justify-center">
              <span className="text-white text-2xl">+</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-shareup-primary rounded-full flex items-center justify-center">
              <span className="text-white text-xs">📷</span>
            </div>
          </div>
          <p className="text-xs text-center mt-2 text-shareup-dark">Your Story</p>
        </div>

        {/* Stories */}
        {stories.map((story, index) => (
          <div 
            key={story.id}
            onClick={() => handleStoryClick(story, index)}
            className="flex-shrink-0 cursor-pointer group"
          >
            <div className={`relative p-0.5 rounded-full ${
              story.isViewed 
                ? 'bg-gray-300' 
                : 'bg-gradient-to-r from-shareup-gradient-start to-shareup-gradient-end'
            }`}>
              <div className="w-16 h-16 rounded-full bg-white p-0.5">
                <img
                  src={story.user.profilePicture || '/api/placeholder/64/64'}
                  alt={`${story.user.firstName} ${story.user.lastName}`}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <p className="text-xs text-center mt-2 text-shareup-dark truncate w-16">
              {story.user.firstName}
            </p>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedStory.user.profilePicture || '/api/placeholder/40/40'}
                  alt={`${selectedStory.user.firstName} ${selectedStory.user.lastName}`}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-white font-semibold">
                    {selectedStory.user.firstName} {selectedStory.user.lastName}
                  </p>
                  <p className="text-white/70 text-sm">
                    {new Date(selectedStory.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={closeStoryViewer}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex space-x-1 mt-4">
              {stories.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-1 rounded-full ${
                    index < currentIndex
                      ? 'bg-white'
                      : index === currentIndex
                      ? 'bg-white/70'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Story Content */}
          <div className="relative w-full h-full flex items-center justify-center">
            {selectedStory.video ? (
              <video
                src={selectedStory.video}
                className="max-w-full max-h-full object-contain"
                autoPlay
                muted
                controls={false}
              />
            ) : (
              <img
                src={selectedStory.image}
                alt="Story"
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Navigation */}
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="text-3xl">‹</span>
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === stories.length - 1}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="text-3xl">›</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
