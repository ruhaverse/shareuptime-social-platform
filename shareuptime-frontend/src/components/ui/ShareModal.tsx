'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ModernShareComponent } from './ModernShareComponent';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle?: string;
  postImage?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  postId,
  postTitle,
  postImage
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-md w-full">
        <ModernShareComponent
          postId={postId}
          postTitle={postTitle}
          postImage={postImage}
          onClose={onClose}
          className="w-full"
        />
      </div>
    </div>
  );
};
