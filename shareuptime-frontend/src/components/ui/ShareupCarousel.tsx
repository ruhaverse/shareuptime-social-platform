'use client';

import React, { useState, useEffect } from 'react';
import { shareupColors } from '@/styles/shareup-colors';

interface CarouselItem {
  id: string;
  image: string;
  title?: string;
  description?: string;
  link?: string;
}

interface ShareupCarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
}

export const ShareupCarousel: React.FC<ShareupCarouselProps> = ({
  items,
  autoPlay = true,
  interval = 5000,
  showDots = true,
  showArrows = true,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, items.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  if (!items || items.length === 0) return null;

  return (
    <div className={`relative w-full overflow-hidden rounded-lg ${className}`}>
      {/* Carousel Items */}
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map((item, index) => (
          <div key={item.id} className="w-full flex-shrink-0 relative">
            <img
              src={item.image}
              alt={item.title || `Slide ${index + 1}`}
              className="w-full h-64 md:h-80 lg:h-96 object-cover"
            />
            
            {/* Overlay Content */}
            {(item.title || item.description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                {item.title && (
                  <h3 className="text-white text-xl font-bold mb-2">
                    {item.title}
                  </h3>
                )}
                {item.description && (
                  <p className="text-white/90 text-sm">
                    {item.description}
                  </p>
                )}
                {item.link && (
                  <a
                    href={item.link}
                    className="inline-block mt-3 px-4 py-2 bg-shareup-primary text-white rounded-lg hover:bg-shareup-primary/90 transition-colors"
                  >
                    Learn More
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && items.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <span className="text-xl">‹</span>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <span className="text-xl">›</span>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-white'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
