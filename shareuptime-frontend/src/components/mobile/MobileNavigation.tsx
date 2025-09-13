'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { shareupColors } from '@/styles/shareup-colors';

interface MobileNavigationProps {
  currentPath?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ currentPath = '/' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: '🏠', label: 'Home' },
    { path: '/reels', icon: '🎬', label: 'Reels' },
    { path: '/messages', icon: '💬', label: 'Messages' },
    { path: '/notifications', icon: '🔔', label: 'Notifications' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-shareup-lighter-gray z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.slice(0, 4).map((item) => (
            <Link key={item.path} href={item.path}>
              <div className={`
                flex flex-col items-center py-2 px-3 rounded-lg
                ${currentPath === item.path 
                  ? `text-shareup-primary bg-shareup-light` 
                  : `text-shareup-gray hover:text-shareup-primary`
                }
                transition-colors duration-200
              `}>
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`
              flex flex-col items-center py-2 px-3 rounded-lg
              ${isMenuOpen 
                ? `text-shareup-primary bg-shareup-light` 
                : `text-shareup-gray hover:text-shareup-primary`
              }
              transition-colors duration-200
            `}
          >
            <span className="text-xl mb-1">☰</span>
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed bottom-16 left-4 right-4 bg-white rounded-2xl shadow-2xl p-6 z-50" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-shareup-dark">Menu</h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-shareup-gray hover:text-shareup-dark"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-shareup-light transition-colors duration-200">
                  <span className="text-xl">👤</span>
                  <span className="font-medium text-shareup-dark">Profile</span>
                </div>
              </Link>
              
              <Link href="/settings" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-shareup-light transition-colors duration-200">
                  <span className="text-xl">⚙️</span>
                  <span className="font-medium text-shareup-dark">Settings</span>
                </div>
              </Link>
              
              <Link href="/friends" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-shareup-light transition-colors duration-200">
                  <span className="text-xl">👥</span>
                  <span className="font-medium text-shareup-dark">Friends</span>
                </div>
              </Link>
              
              <Link href="/help" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-shareup-light transition-colors duration-200">
                  <span className="text-xl">❓</span>
                  <span className="font-medium text-shareup-dark">Help</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
