'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, RotateCcw, Image, X, Circle, Square, Play, Pause } from 'lucide-react';
import { shareupColors } from '@/styles/shareup-colors';

interface AdvancedCameraControlsProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  mode?: 'photo' | 'video';
  title?: string;
  onlyVideo?: boolean;
}

export const AdvancedCameraControls: React.FC<AdvancedCameraControlsProps> = ({
  onCapture,
  onClose,
  mode = 'photo',
  title = 'Create Content',
  onlyVideo = false
}) => {
  const [currentMode, setCurrentMode] = useState<'photo' | 'video'>(mode);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Initialize camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [cameraFacing]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: currentMode === 'video'
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const toggleCamera = () => {
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleCapture = async () => {
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

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    if (context) {
      context.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const startRecording = () => {
    if (!stream) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
      const file = new File([blob], `video-${Date.now()}.mp4`, { type: 'video/mp4' });
      onCapture(file);
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);

    // Start recording timer
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 30) { // Max 30 seconds
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const openGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = currentMode === 'photo' ? 'image/*' : 'video/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onCapture(file);
      }
    };
    input.click();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black/50 relative z-10">
        <h2 className="text-white text-xl font-bold">{title}</h2>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/10"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center bg-red-600 px-3 py-2 rounded-full animate-pulse">
            <div className="w-3 h-3 bg-white rounded-full mr-2" />
            <span className="text-white text-sm font-bold">
              REC {formatTime(recordingTime)}
            </span>
          </div>
        )}

        {/* Recording Progress Bar */}
        {isRecording && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-black/30">
            <div 
              className="h-full bg-red-500 transition-all duration-1000"
              style={{ width: `${(recordingTime / 30) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-black/70 p-6 relative z-10">
        {/* Mode Selector */}
        {!onlyVideo && (
          <div className="flex justify-center mb-6">
            <div className="flex bg-black/50 rounded-full p-1 border border-white/20">
              <button
                onClick={() => setCurrentMode('photo')}
                className={`flex items-center px-6 py-3 rounded-full transition-all duration-200 ${
                  currentMode === 'photo'
                    ? 'bg-white text-black font-bold'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Camera className="w-4 h-4 mr-2" />
                <span className="font-medium">Photo</span>
              </button>
              <button
                onClick={() => setCurrentMode('video')}
                className={`flex items-center px-6 py-3 rounded-full transition-all duration-200 ${
                  currentMode === 'video'
                    ? 'bg-white text-black font-bold'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Video className="w-4 h-4 mr-2" />
                <span className="font-medium">Video</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          {/* Gallery Button */}
          <button 
            onClick={openGallery}
            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 hover:scale-110"
          >
            <Image className="w-6 h-6 text-white" />
          </button>

          {/* Capture Button */}
          <button
            onClick={handleCapture}
            className={`relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all duration-200 hover:scale-110 ${
              currentMode === 'video' && isRecording
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            {currentMode === 'photo' ? (
              <Circle className="w-12 h-12 text-white fill-current" />
            ) : isRecording ? (
              <Square className="w-8 h-8 text-white fill-current" />
            ) : (
              <Circle className="w-12 h-12 text-red-500 fill-current" />
            )}
          </button>

          {/* Camera Flip Button */}
          <button
            onClick={toggleCamera}
            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 hover:scale-110"
          >
            <RotateCcw className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Recording Instructions */}
        {currentMode === 'video' && !isRecording && (
          <div className="text-center mt-4">
            <p className="text-white/70 text-sm">
              Tap to start recording • Max 30 seconds
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
