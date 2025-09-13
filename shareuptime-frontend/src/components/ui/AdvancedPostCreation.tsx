'use client';

import React, { useState, useRef } from 'react';
import { X, Image, Video, MapPin, Users, Smile, Hash, Send, Camera } from 'lucide-react';
import { shareupColors } from '@/styles/shareup-colors';
import { AdvancedCameraControls } from './AdvancedCameraControls';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface AdvancedPostCreationProps {
  currentUser: User;
  onPost: (postData: PostData) => void;
  onClose: () => void;
}

interface PostData {
  content: string;
  images?: File[];
  video?: File;
  location?: string;
  taggedUsers?: User[];
  privacy: 'public' | 'friends' | 'private';
}

export const AdvancedPostCreation: React.FC<AdvancedPostCreationProps> = ({
  currentUser,
  onPost,
  onClose
}) => {
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [location, setLocation] = useState('');
  const [taggedUsers, setTaggedUsers] = useState<User[]>([]);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [showCamera, setShowCamera] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedImages(prev => [...prev, ...files].slice(0, 10)); // Max 10 images
      setSelectedVideo(null); // Clear video if images selected
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedVideo(file);
      setSelectedImages([]); // Clear images if video selected
    }
  };

  const handleCameraCapture = (file: File) => {
    if (file.type.startsWith('image/')) {
      setSelectedImages(prev => [...prev, file].slice(0, 10));
      setSelectedVideo(null);
    } else if (file.type.startsWith('video/')) {
      setSelectedVideo(file);
      setSelectedImages([]);
    }
    setShowCamera(false);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setSelectedVideo(null);
  };

  const handlePost = () => {
    if (!content.trim() && selectedImages.length === 0 && !selectedVideo) return;

    const postData: PostData = {
      content: content.trim(),
      images: selectedImages.length > 0 ? selectedImages : undefined,
      video: selectedVideo || undefined,
      location: location.trim() || undefined,
      taggedUsers: taggedUsers.length > 0 ? taggedUsers : undefined,
      privacy
    };

    onPost(postData);
    onClose();
  };

  const getPrivacyIcon = () => {
    switch (privacy) {
      case 'public': return '🌍';
      case 'friends': return '👥';
      case 'private': return '🔒';
      default: return '🌍';
    }
  };

  if (showCamera) {
    return (
      <AdvancedCameraControls
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
        title="Create Post"
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
              {currentUser.profilePicture ? (
                <img 
                  src={currentUser.profilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold">
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {currentUser.firstName} {currentUser.lastName}
              </p>
              <button
                onClick={() => {
                  const nextPrivacy = privacy === 'public' ? 'friends' : privacy === 'friends' ? 'private' : 'public';
                  setPrivacy(nextPrivacy);
                }}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span>{getPrivacyIcon()}</span>
                <span className="capitalize">{privacy}</span>
              </button>
            </div>
          </div>

          {/* Text Input */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 text-lg border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            maxLength={2000}
          />

          {/* Character Count */}
          <div className="text-right text-sm text-gray-500 mt-1">
            {content.length}/2000
          </div>

          {/* Media Preview */}
          {selectedImages.length > 0 && (
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-2">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Selected ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedVideo && (
            <div className="mt-4 relative">
              <video
                src={URL.createObjectURL(selectedVideo)}
                className="w-full h-64 object-cover rounded-lg"
                controls
              />
              <button
                onClick={removeVideo}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* Location Input */}
          {showLocationInput && (
            <div className="mt-4">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location..."
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Tagged Users */}
          {taggedUsers.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {taggedUsers.map((user, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    @{user.firstName} {user.lastName}
                    <button
                      onClick={() => setTaggedUsers(prev => prev.filter((_, i) => i !== index))}
                      className="ml-2 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                title="Add Photos"
              >
                <Image className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                onClick={() => videoInputRef.current?.click()}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                title="Add Video"
              >
                <Video className="w-5 h-5 text-gray-600" />
              </button>

              <button
                onClick={() => setShowCamera(true)}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                title="Take Photo/Video"
              >
                <Camera className="w-5 h-5 text-gray-600" />
              </button>

              <button
                onClick={() => setShowLocationInput(!showLocationInput)}
                className={`p-3 rounded-full transition-colors ${
                  showLocationInput ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Add Location"
              >
                <MapPin className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowTagInput(!showTagInput)}
                className={`p-3 rounded-full transition-colors ${
                  showTagInput ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Tag People"
              >
                <Users className="w-5 h-5" />
              </button>

              <button
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                title="Add Emoji"
              >
                <Smile className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Post Button */}
          <button
            onClick={handlePost}
            disabled={!content.trim() && selectedImages.length === 0 && !selectedVideo}
            className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
              content.trim() || selectedImages.length > 0 || selectedVideo
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
            <span>Share Post</span>
          </button>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};
