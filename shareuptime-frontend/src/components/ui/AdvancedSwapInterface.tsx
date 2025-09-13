'use client';

import React, { useState } from 'react';
import { Camera, Image, ArrowRight, X, Upload, Zap, Users, Trophy } from 'lucide-react';
import { shareupColors } from '@/styles/shareup-colors';
import { AdvancedCameraControls } from './AdvancedCameraControls';

interface AdvancedSwapInterfaceProps {
  onSwapCreate?: (swapData: any) => void;
  onClose?: () => void;
  returnSwap?: boolean;
  swapPostId?: string;
}

export const AdvancedSwapInterface: React.FC<AdvancedSwapInterfaceProps> = ({
  onSwapCreate,
  onClose,
  returnSwap = false,
  swapPostId
}) => {
  const [currentStep, setCurrentStep] = useState<'intro' | 'camera' | 'preview'>('intro');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setCurrentStep('preview');
  };

  const handleCameraCapture = (file: File) => {
    handleFileSelect(file);
  };

  const handleGallerySelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    };
    input.click();
  };

  const handleSwapSubmit = () => {
    if (selectedFile) {
      const swapData = {
        file: selectedFile,
        returnSwap,
        swapPostId,
        timestamp: new Date().toISOString()
      };
      onSwapCreate?.(swapData);
    }
  };

  if (currentStep === 'camera') {
    return (
      <AdvancedCameraControls
        mode="photo"
        title="Swap Photo"
        onCapture={handleCameraCapture}
        onClose={() => setCurrentStep('intro')}
      />
    );
  }

  if (currentStep === 'preview') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-black/50">
          <button
            onClick={() => setCurrentStep('intro')}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-white text-xl font-bold">Preview Swap</h2>
          <div className="w-6 h-6" />
        </div>

        {/* Preview Image */}
        <div className="flex-1 flex items-center justify-center bg-black">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Swap preview"
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        {/* Submit Button */}
        <div className="p-6 bg-black/70">
          <button
            onClick={handleSwapSubmit}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Zap className="w-5 h-5" />
            <span>{returnSwap ? 'Submit Swap Response' : 'Create Swap Challenge'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/10"
        >
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-white text-2xl font-bold">Let's Swap</h1>
        <div className="w-10 h-10" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between p-6">
        {/* Upper Section */}
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <div className="w-32 h-32 mx-auto bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-white text-2xl font-bold">
                {returnSwap ? 'Respond to Swap' : 'Create Swap Challenge'}
              </h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-sm mx-auto">
                {returnSwap 
                  ? 'Show your version of this challenge!'
                  : 'To swap you will need to provide a clear image of the object you want to swap'
                }
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-white/60 text-sm">Active Swaps</p>
              <p className="text-white font-bold text-xl">1.2K</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-2">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <p className="text-white/60 text-sm">Completed</p>
              <p className="text-white font-bold text-xl">856</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Camera Button */}
          <button
            onClick={() => setCurrentStep('camera')}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-200 flex items-center justify-center space-x-3"
          >
            <Camera className="w-6 h-6" />
            <span>Take Picture</span>
          </button>

          {/* Separator */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-white/60 text-sm font-medium">or</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* Gallery Button */}
          <div className="text-center space-y-3">
            <p className="text-gray-600">Can&apos;t recreate this? Try a different angle!</p>
            <button
              onClick={handleGallerySelect}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-3"
            >
              <Upload className="w-6 h-6" />
              <span>Choose from Gallery</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
    </div>
  );
};
