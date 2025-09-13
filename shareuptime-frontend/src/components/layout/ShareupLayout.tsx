'use client';

import React from 'react';
import { MobileNavigation } from '@/components/mobile/MobileNavigation';
import { shareupColors } from '@/styles/shareup-colors';

interface ShareupLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
  showMobileNav?: boolean;
}

export const ShareupLayout: React.FC<ShareupLayoutProps> = ({
  children,
  currentPath = '/',
  showMobileNav = true,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className={`${showMobileNav ? 'pb-20 md:pb-0' : ''}`}>
        {children}
      </main>

      {/* Mobile Navigation */}
      {showMobileNav && <MobileNavigation currentPath={currentPath} />}
    </div>
  );
};
