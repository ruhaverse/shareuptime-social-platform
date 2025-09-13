'use client';

import React, { useState } from 'react';
import { shareupColors } from '@/styles/shareup-colors';

interface ShareupImageGalleryProps {
  images: string[];
  onImageClick?: (index: number) => void;
  className?: string;
}

export const ShareupImageGallery: React.FC<ShareupImageGalleryProps> = ({
  images,
  onImageClick,
  className = ''
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    onImageClick?.(index);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) return null;

  const renderImageGrid = () => {
    if (images.length === 1) {
      return (
        <div className="relative w-full">
          <img
            src={images[0]}
            alt="Post image"
            className="w-full max-h-96 object-cover rounded-lg cursor-pointer"
            onClick={() => openLightbox(0)}
          />
        </div>
      );
    }

    if (images.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-2">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Post image ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg cursor-pointer"
              onClick={() => openLightbox(index)}
            />
          ))}
        </div>
      );
    }

    if (images.length === 3) {
      return (
        <div className="grid grid-cols-2 gap-2">
          <img
            src={images[0]}
            alt="Post image 1"
            className="w-full h-96 object-cover rounded-lg cursor-pointer"
            onClick={() => openLightbox(0)}
          />
          <div className="grid grid-rows-2 gap-2">
            <img
              src={images[1]}
              alt="Post image 2"
              className="w-full h-47 object-cover rounded-lg cursor-pointer"
              onClick={() => openLightbox(1)}
            />
            <img
              src={images[2]}
              alt="Post image 3"
              className="w-full h-47 object-cover rounded-lg cursor-pointer"
              onClick={() => openLightbox(2)}
            />
          </div>
        </div>
      );
    }

    if (images.length >= 4) {
      return (
        <div className="grid grid-cols-2 gap-2">
          <img
            src={images[0]}
            alt="Post image 1"
            className="w-full h-48 object-cover rounded-lg cursor-pointer"
            onClick={() => openLightbox(0)}
          />
          <img
            src={images[1]}
            alt="Post image 2"
            className="w-full h-48 object-cover rounded-lg cursor-pointer"
            onClick={() => openLightbox(1)}
          />
          <img
            src={images[2]}
            alt="Post image 3"
            className="w-full h-48 object-cover rounded-lg cursor-pointer"
            onClick={() => openLightbox(2)}
          />
          <div className="relative">
            <img
              src={images[3]}
              alt="Post image 4"
              className="w-full h-48 object-cover rounded-lg cursor-pointer"
              onClick={() => openLightbox(3)}
            />
            {images.length > 4 && (
              <div 
                className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center cursor-pointer"
                onClick={() => openLightbox(3)}
              >
                <span className="text-white text-2xl font-bold">
                  +{images.length - 4}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <div className={`${className}`}>
        {renderImageGrid()}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-white">
                {currentImageIndex + 1} / {images.length}
              </span>
              <button
                onClick={closeLightbox}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={images[currentImageIndex]}
              alt={`Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                >
                  <span className="text-4xl">‹</span>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                >
                  <span className="text-4xl">›</span>
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-2 bg-black/50 rounded-lg p-2">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-12 h-12 object-cover rounded cursor-pointer transition-opacity ${
                      index === currentImageIndex ? 'opacity-100 ring-2 ring-white' : 'opacity-60'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
