'use client';

import React, { useState, useEffect } from 'react';
import { shareupColors } from '@/styles/shareup-colors';
import { Plus, Play } from 'lucide-react';

interface Story {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  imageUrl: string;
  timestamp: string;
  viewed?: boolean;
}

interface AdvancedStoriesComponentProps {
  stories: Story[];
  currentUserId?: string;
  onStoryClick?: (story: Story) => void;
  onCreateStory?: () => void;
}

export const AdvancedStoriesComponent: React.FC<AdvancedStoriesComponentProps> = ({
  stories,
  currentUserId,
  onStoryClick,
  onCreateStory
}) => {
  const [groupedStories, setGroupedStories] = useState<{ [userId: string]: Story[] }>({});

  useEffect(() => {
    // Group stories by user
    const grouped = stories.reduce((acc, story) => {
      const userId = story.user.id;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(story);
      return acc;
    }, {} as { [userId: string]: Story[] });

    setGroupedStories(grouped);
  }, [stories]);

  const handleStoryClick = (userStories: Story[]) => {
    if (onStoryClick && userStories.length > 0) {
      onStoryClick(userStories[0]); // Start with first story of user
    }
  };

  const getStoryRingColor = (userStories: Story[]) => {
    const hasUnviewed = userStories.some(story => !story.viewed);
    return hasUnviewed ? '#3b82f6' : '#e5e7eb';
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide">
        {/* Create Story Button */}
        {currentUserId && (
          <div className="flex-shrink-0">
            <button
              onClick={onCreateStory}
              className="relative w-16 h-16 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center group"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </button>
            <p className="text-xs text-center mt-2 text-gray-600 font-medium">Your Story</p>
          </div>
        )}

        {/* User Stories */}
        {Object.entries(groupedStories).map(([userId, userStories]) => {
          const latestStory = userStories[0];
          const storyCount = userStories.length;
          
          return (
            <div key={userId} className="flex-shrink-0">
              <button
                onClick={() => handleStoryClick(userStories)}
                className="relative group"
              >
                {/* Story Ring */}
                <div 
                  className="w-16 h-16 rounded-full p-0.5 transition-all duration-200 group-hover:scale-105"
                  style={{ 
                    background: `linear-gradient(45deg, ${getStoryRingColor(userStories)}, #6366f1)` 
                  }}
                >
                  <div className="w-full h-full rounded-full p-0.5 bg-white">
                    <img
                      src={latestStory.user.profilePicture || '/api/placeholder/64/64'}
                      alt={`${latestStory.user.firstName} ${latestStory.user.lastName}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>

                {/* Story Count Badge */}
                {storyCount > 1 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-xs font-bold text-white">{storyCount}</span>
                  </div>
                )}

                {/* Play Icon Overlay */}
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </button>

              {/* User Name */}
              <p className="text-xs text-center mt-2 text-gray-700 font-medium max-w-16 truncate">
                {latestStory.user.firstName}
              </p>
            </div>
          );
        })}

        {/* Empty State */}
        {Object.keys(groupedStories).length === 0 && !currentUserId && (
          <div className="flex-1 text-center py-8">
            <div className="text-gray-400 mb-2">
              <Play className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-gray-500 text-sm">No stories to show</p>
          </div>
        )}
      </div>
    </div>
  );
};
