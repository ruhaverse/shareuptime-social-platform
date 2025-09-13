import React from 'react';
import { shareupColors } from '@/styles/shareup-colors';

interface ShareupInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  icon?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const ShareupInput: React.FC<ShareupInputProps> = ({
  placeholder,
  value,
  onChange,
  type = 'text',
  icon,
  disabled = false,
  error,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={`text-[${shareupColors.dimGray}] text-lg`}>
              {icon}
            </span>
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full px-4 py-3 ${icon ? 'pl-12' : 'pl-4'}
            bg-[${shareupColors.aliceBlue}] 
            border border-transparent
            rounded-lg
            text-[${shareupColors.dark}]
            placeholder-[${shareupColors.dimGray}]
            focus:outline-none 
            focus:ring-2 
            focus:ring-[${shareupColors.iondigoDye}] 
            focus:border-transparent
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? `border-[${shareupColors.red}] ring-1 ring-[${shareupColors.red}]` : ''}
          `}
        />
      </div>
      {error && (
        <p className={`mt-1 text-sm text-[${shareupColors.red}]`}>
          {error}
        </p>
      )}
    </div>
  );
};
