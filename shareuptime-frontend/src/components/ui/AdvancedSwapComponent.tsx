'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X, MapPin, Clock, Users, Share2, Heart, MessageCircle } from 'lucide-react';
import { shareupColors } from '@/styles/shareup-colors';
import { AdvancedCameraControls } from './AdvancedCameraControls';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface SwapPost {
  id: string;
  user: User;
  originalImage: string;
  swapImage?: string;
  caption: string;
  location?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  timeLimit?: number; // in hours
}

interface AdvancedSwapComponentProps {
  currentUser: User;
  swapPosts: SwapPost[];
  onCreateSwap: (swapData: SwapData) => void;
  onSwapResponse: (postId: string, responseImage: File) => void;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
}

interface SwapData {
  originalImage: File;
  caption: string;
  location?: string;
  timeLimit: number;
}

export const AdvancedSwapComponent: React.FC<AdvancedSwapComponentProps> = ({
  currentUser,
  swapPosts,
  onCreateSwap,
  onSwapResponse,
  onLike,
  onComment,
  onShare
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'feed'>('create');
  const [showCamera, setShowCamera] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [timeLimit, setTimeLimit] = useState(24);
  const [showSwapCamera, setShowSwapCamera] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleCameraCapture = (file: File) => {
    if (showSwapCamera) {
      // Handle swap response
      onSwapResponse(showSwapCamera, file);
      setShowSwapCamera(null);
    } else {
      // Handle original image for new swap
      setSelectedImage(file);
      setShowCamera(false);
    }
  };

  const handleCreateSwap = () => {
    if (!selectedImage || !caption.trim()) return;

    const swapData: SwapData = {
      originalImage: selectedImage,
      caption: caption.trim(),
      location: location.trim() || undefined,
      timeLimit
    };

    onCreateSwap(swapData);
    
    // Reset form
    setSelectedImage(null);
    setCaption('');
    setLocation('');
    setTimeLimit(24);
  };

  const formatTimeRemaining = (timestamp: string, timeLimit: number) => {
    const postTime = new Date(timestamp).getTime();
    const expiryTime = postTime + (timeLimit * 60 * 60 * 1000);
    const now = Date.now();
    const remaining = expiryTime - now;
    
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  if (showCamera || showSwapCamera) {
    return (
      <AdvancedCameraControls
        onCapture={handleCameraCapture}
        onClose={() => {
          setShowCamera(false);
          setShowSwapCamera(null);
        }}
        title={showSwapCamera ? "Swap Response" : "Create Swap"}
        mode="photo"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header Tabs */}
      <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-4 px-6 font-semibold rounded-xl transition-all duration-200 ${
            activeTab === 'create'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          Create Swap
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex-1 py-4 px-6 font-semibold rounded-xl transition-all duration-200 ${
            activeTab === 'feed'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          Swap Feed
        </button>
      </div>

      {activeTab === 'create' ? (
        /* Create Swap Tab */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Photo Swap Challenge</h2>
          
          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original Photo
            </label>
            {selectedImage ? (
              <div className="relative">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selected"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setShowCamera(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Take Photo</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Upload</span>
                    </button>
                  </div>
                  <p className="text-gray-500">Share a photo for others to recreate</p>
                </div>
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Challenge Description
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe your photo challenge..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {caption.length}/500
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location (Optional)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Time Limit */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Challenge Duration
            </label>
            <div className="flex items-center space-x-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <select
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>1 hour</option>
                <option value={6}>6 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
                <option value={168}>1 week</option>
              </select>
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateSwap}
            disabled={!selectedImage || !caption.trim()}
            className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
              selectedImage && caption.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Create Swap Challenge
          </button>
        </div>
      ) : (
        /* Swap Feed Tab */
        <div className="space-y-6">
          {swapPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                    {post.user.profilePicture ? (
                      <img 
                        src={post.user.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold">
                        {post.user.firstName[0]}{post.user.lastName[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {post.user.firstName} {post.user.lastName}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      {post.location && (
                        <>
                          <MapPin className="w-3 h-3" />
                          <span>{post.location}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{formatTimeRemaining(post.timestamp, post.timeLimit || 24)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-4">
                <p className="text-gray-900 mb-4">{post.caption}</p>
                
                {/* Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Original</p>
                    <img
                      src={post.originalImage}
                      alt="Original"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                  {post.swapImage ? (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Your Swap</p>
                      <img
                        src={post.swapImage}
                        alt="Swap"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                      <button
                        onClick={() => setShowSwapCamera(post.id)}
                        className="flex flex-col items-center space-y-2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <Camera className="w-8 h-8" />
                        <span className="font-medium">Take Swap Photo</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => onLike(post.id)}
                      className={`flex items-center space-x-2 transition-colors ${
                        post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    
                    <button
                      onClick={() => onComment(post.id)}
                      className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.comments}</span>
                    </button>
                    
                    <button
                      onClick={() => onShare(post.id)}
                      className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>{post.shares}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {swapPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Swap Challenges Yet</h3>
              <p className="text-gray-500 mb-4">Be the first to create a photo swap challenge!</p>
              <button
                onClick={() => setActiveTab('create')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Swap
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  );
};
