import React from 'react';
import { shareupColors } from '@/styles/shareup-colors';

interface ShareupButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const ShareupButton: React.FC<ShareupButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return `bg-[${shareupColors.iondigoDye}] text-white hover:bg-opacity-90`;
      case 'secondary':
        return `bg-[${shareupColors.aliceBlue}] text-[${shareupColors.iondigoDye}] hover:bg-opacity-80`;
      case 'success':
        return `bg-[${shareupColors.primaryGreen}] text-white hover:bg-opacity-90`;
      case 'danger':
        return `bg-[${shareupColors.red}] text-white hover:bg-opacity-90`;
      default:
        return `bg-[${shareupColors.iondigoDye}] text-white hover:bg-opacity-90`;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'px-4 py-2 text-sm';
      case 'medium':
        return 'px-6 py-3 text-base';
      case 'large':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  return (
    <button
      onClick={onPress}
      disabled={disabled || loading}
      className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        rounded-lg font-semibold transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95 transform
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : (
        title
      )}
    </button>
  );
};
