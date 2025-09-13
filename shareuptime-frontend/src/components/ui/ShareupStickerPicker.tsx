'use client';

import React, { useState } from 'react';
import { shareupColors } from '@/styles/shareup-colors';

interface Sticker {
  id: string;
  url: string;
  name: string;
  category: string;
}

interface ShareupStickerPickerProps {
  onStickerSelect: (sticker: Sticker) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareupStickerPicker: React.FC<ShareupStickerPickerProps> = ({
  onStickerSelect,
  isOpen,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState('popular');

  const categories = [
    { id: 'popular', name: 'Popular', icon: '🔥' },
    { id: 'emotions', name: 'Emotions', icon: '😊' },
    { id: 'animals', name: 'Animals', icon: '🐱' },
    { id: 'food', name: 'Food', icon: '🍕' },
    { id: 'activities', name: 'Activities', icon: '⚽' },
  ];

  // Mock stickers data
  const stickers: Record<string, Sticker[]> = {
    popular: [
      { id: '1', url: '/stickers/heart.png', name: 'Heart', category: 'popular' },
      { id: '2', url: '/stickers/thumbs-up.png', name: 'Thumbs Up', category: 'popular' },
      { id: '3', url: '/stickers/fire.png', name: 'Fire', category: 'popular' },
      { id: '4', url: '/stickers/star.png', name: 'Star', category: 'popular' },
    ],
    emotions: [
      { id: '5', url: '/stickers/happy.png', name: 'Happy', category: 'emotions' },
      { id: '6', url: '/stickers/love.png', name: 'Love', category: 'emotions' },
      { id: '7', url: '/stickers/surprised.png', name: 'Surprised', category: 'emotions' },
      { id: '8', url: '/stickers/cool.png', name: 'Cool', category: 'emotions' },
    ],
    animals: [
      { id: '9', url: '/stickers/cat.png', name: 'Cat', category: 'animals' },
      { id: '10', url: '/stickers/dog.png', name: 'Dog', category: 'animals' },
      { id: '11', url: '/stickers/panda.png', name: 'Panda', category: 'animals' },
      { id: '12', url: '/stickers/unicorn.png', name: 'Unicorn', category: 'animals' },
    ],
    food: [
      { id: '13', url: '/stickers/pizza.png', name: 'Pizza', category: 'food' },
      { id: '14', url: '/stickers/burger.png', name: 'Burger', category: 'food' },
      { id: '15', url: '/stickers/cake.png', name: 'Cake', category: 'food' },
      { id: '16', url: '/stickers/coffee.png', name: 'Coffee', category: 'food' },
    ],
    activities: [
      { id: '17', url: '/stickers/soccer.png', name: 'Soccer', category: 'activities' },
      { id: '18', url: '/stickers/music.png', name: 'Music', category: 'activities' },
      { id: '19', url: '/stickers/travel.png', name: 'Travel', category: 'activities' },
      { id: '20', url: '/stickers/gaming.png', name: 'Gaming', category: 'activities' },
    ],
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 w-80 z-50">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-shareup-dark">Stickers</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Categories */}
        <div className="flex space-x-1 mb-3 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-shareup-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Stickers Grid */}
        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
          {stickers[selectedCategory]?.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => {
                onStickerSelect(sticker);
                onClose();
              }}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={sticker.name}
            >
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                {sticker.name === 'Heart' && '❤️'}
                {sticker.name === 'Thumbs Up' && '👍'}
                {sticker.name === 'Fire' && '🔥'}
                {sticker.name === 'Star' && '⭐'}
                {sticker.name === 'Happy' && '😊'}
                {sticker.name === 'Love' && '😍'}
                {sticker.name === 'Surprised' && '😲'}
                {sticker.name === 'Cool' && '😎'}
                {sticker.name === 'Cat' && '🐱'}
                {sticker.name === 'Dog' && '🐶'}
                {sticker.name === 'Panda' && '🐼'}
                {sticker.name === 'Unicorn' && '🦄'}
                {sticker.name === 'Pizza' && '🍕'}
                {sticker.name === 'Burger' && '🍔'}
                {sticker.name === 'Cake' && '🎂'}
                {sticker.name === 'Coffee' && '☕'}
                {sticker.name === 'Soccer' && '⚽'}
                {sticker.name === 'Music' && '🎵'}
                {sticker.name === 'Travel' && '✈️'}
                {sticker.name === 'Gaming' && '🎮'}
              </div>
            </button>
          )) || (
            <div className="col-span-4 text-center py-8 text-gray-500">
              No stickers available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
