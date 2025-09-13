'use client';

import React, { useState, useRef } from 'react';
import { shareupColors } from '@/styles/shareup-colors';

interface ShareupCameraProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  mode?: 'photo' | 'video';
  title?: string;
}

export const ShareupCamera: React.FC<ShareupCameraProps> = ({
  onCapture,
  onClose,
  mode = 'photo',
  title = 'Create Content'
}) => {
  const [currentMode, setCurrentMode] = useState<'photo' | 'video'>(mode);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing },
        audio: currentMode === 'video'
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      if (context) {
        context.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            onCapture(file);
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const startRecording = () => {
    if (streamRef.current) {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], 'video.webm', { type: 'video/webm' });
        onCapture(file);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleCamera = () => {
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user');
    stopCamera();
    setTimeout(startCamera, 100);
  };

  const handleCapture = () => {
    if (currentMode === 'photo') {
      capturePhoto();
    } else {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [cameraFacing]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black/50">
        <h2 className="text-white text-xl font-semibold">{title}</h2>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <span className="text-2xl">✕</span>
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center bg-red-600 px-3 py-1 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
            <span className="text-white text-sm font-medium">Recording...</span>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-black/70 p-6">
        {/* Mode Selector */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-black/50 rounded-full p-1">
            <button
              onClick={() => setCurrentMode('photo')}
              className={`
                flex items-center px-4 py-2 rounded-full transition-all duration-200
                ${currentMode === 'photo' 
                  ? 'bg-red-600 text-white' 
                  : 'text-white/70 hover:text-white'
                }
              `}
            >
              <span className="mr-2">📷</span>
              <span className="font-medium">Photo</span>
            </button>
            <button
              onClick={() => setCurrentMode('video')}
              className={`
                flex items-center px-4 py-2 rounded-full transition-all duration-200
                ${currentMode === 'video' 
                  ? 'bg-red-600 text-white' 
                  : 'text-white/70 hover:text-white'
                }
              `}
            >
              <span className="mr-2">🎥</span>
              <span className="font-medium">Video</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          {/* Gallery Button */}
          <button className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <span className="text-white text-2xl">🖼️</span>
          </button>

          {/* Capture Button */}
          <button
            onClick={handleCapture}
            className={`
              w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center
              transition-all duration-200 hover:scale-105
              ${isRecording ? 'bg-red-600' : 'bg-white'}
            `}
          >
            <div className={`
              ${currentMode === 'video' && isRecording 
                ? 'w-6 h-6 bg-white rounded-sm' 
                : `w-16 h-16 rounded-full ${currentMode === 'video' ? 'bg-red-600' : 'bg-white'}`
              }
            `} />
          </button>

          {/* Camera Flip Button */}
          <button
            onClick={toggleCamera}
            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <span className="text-white text-2xl">🔄</span>
          </button>
        </div>
      </div>
    </div>
  );
};
