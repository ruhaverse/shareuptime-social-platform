'use client';

import React, { useState } from 'react';
import { ShareupButton } from '@/components/ui/ShareupButton';
import { ShareupInput } from '@/components/ui/ShareupInput';
import { ShareupCard } from '@/components/ui/ShareupCard';
import { ShareupCamera } from '@/components/media/ShareupCamera';
import { shareupColors } from '@/styles/shareup-colors';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (content: string, media?: File[]) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPost
}) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim() && media.length === 0) return;
    
    setPosting(true);
    try {
      await onPost(content, media);
      setContent('');
      setMedia([]);
      onClose();
    } catch (error) {
      console.error('Post creation failed:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setMedia(prev => [...prev, ...files]);
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleCameraCapture = (file: File) => {
    setMedia(prev => [...prev, file]);
    setShowCamera(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <ShareupCard className="max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-shareup-dark">Create Post</h2>
              <button
                onClick={onClose}
                className="text-shareup-gray hover:text-shareup-dark transition-colors"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-shareup-profile flex items-center justify-center mr-3">
                <span className="text-white font-semibold">U</span>
              </div>
              <div>
                <p className="font-semibold text-shareup-dark">Your Name</p>
                <div className="flex items-center space-x-2">
                  <select className="text-sm bg-shareup-light rounded px-2 py-1 border-none outline-none">
                    <option>🌍 Public</option>
                    <option>👥 Friends</option>
                    <option>🔒 Only me</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Content Input */}
            <div className="mb-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full h-32 p-4 border border-shareup-lighter-gray rounded-lg resize-none outline-none focus:ring-2 focus:ring-shareup-primary focus:border-transparent"
              />
            </div>

            {/* Media Preview */}
            {media.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {media.map((file, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-square bg-shareup-light rounded-lg overflow-hidden">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={URL.createObjectURL(file)}
                            className="w-full h-full object-cover"
                            controls
                          />
                        )}
                      </div>
                      <button
                        onClick={() => removeMedia(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media Options */}
            <div className="border border-shareup-lighter-gray rounded-lg p-4 mb-6">
              <p className="font-medium text-shareup-dark mb-3">Add to your post</p>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors">
                    <span className="text-green-600 text-xl">📷</span>
                  </div>
                </label>

                <button
                  onClick={() => setShowCamera(true)}
                  className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                >
                  <span className="text-blue-600 text-xl">📹</span>
                </button>

                <button className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center hover:bg-yellow-200 transition-colors">
                  <span className="text-yellow-600 text-xl">😊</span>
                </button>

                <button className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors">
                  <span className="text-purple-600 text-xl">📍</span>
                </button>

                <button className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors">
                  <span className="text-red-600 text-xl">🏷️</span>
                </button>
              </div>
            </div>

            {/* Post Button */}
            <ShareupButton
              title={posting ? 'Posting...' : 'Post'}
              onPress={handlePost}
              loading={posting}
              disabled={!content.trim() && media.length === 0}
              className="w-full"
              size="large"
            />
          </ShareupCard>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <ShareupCamera
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
          title="Add Media"
        />
      )}
    </>
  );
};
