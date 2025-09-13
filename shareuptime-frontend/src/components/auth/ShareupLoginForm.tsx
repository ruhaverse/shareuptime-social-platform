'use client';

import React, { useState } from 'react';
import { ShareupButton } from '@/components/ui/ShareupButton';
import { ShareupInput } from '@/components/ui/ShareupInput';
import { ShareupCard } from '@/components/ui/ShareupCard';
import { shareupColors } from '@/styles/shareup-colors';
import { AuthService } from '@/lib/auth';

interface LoginFormData {
  email: string;
  password: string;
}

interface ShareupLoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
}

export const ShareupLoginForm: React.FC<ShareupLoginFormProps> = ({
  onSuccess,
  onForgotPassword,
  onSignUp,
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const authService = new AuthService();

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 3) {
      newErrors.password = 'Password must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setGeneralError('');

    try {
      await authService.login(formData.email, formData.password);
      onSuccess?.();
    } catch (error: any) {
      setGeneralError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#9039CC] to-[#160390A1] p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className={`
            w-32 h-32 mx-auto mb-6 
            bg-white rounded-full 
            flex items-center justify-center
            shadow-lg
          `}>
            <span className={`text-4xl font-bold text-[${shareupColors.iondigoDye}]`}>
              SU
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-white/80">
            Sign in to continue to ShareUpTime
          </p>
        </div>

        {/* Login Form */}
        <ShareupCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            {generalError && (
              <div className={`
                p-3 rounded-lg 
                bg-[${shareupColors.red}]/10 
                border border-[${shareupColors.red}]/20
                text-[${shareupColors.red}] 
                text-sm
              `}>
                {generalError}
              </div>
            )}

            <ShareupInput
              placeholder="Email Address"
              type="email"
              value={formData.email}
              onChange={(value) => updateFormData('email', value)}
              icon="📧"
              error={errors.email}
            />

            <ShareupInput
              placeholder="Password"
              type="password"
              value={formData.password}
              onChange={(value) => updateFormData('password', value)}
              icon="🔒"
              error={errors.password}
            />

            <div className="text-right">
              <button
                type="button"
                onClick={onForgotPassword}
                className={`
                  text-sm text-[${shareupColors.iondigoDye}] 
                  hover:underline font-semibold
                `}
              >
                Forgot Password?
              </button>
            </div>

            <ShareupButton
              title="Share in"
              onPress={() => handleSubmit}
              loading={loading}
              className="w-full"
              size="large"
            />

            {/* Alternative Login Options */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t border-[${shareupColors.lighterGray}]`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 bg-white text-[${shareupColors.dimGray}]`}>
                  or
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                className={`
                  w-full flex items-center justify-center px-4 py-3
                  border border-[${shareupColors.lighterGray}]
                  rounded-lg
                  text-[${shareupColors.dark}] font-medium
                  hover:bg-[${shareupColors.aliceBlue}]
                  transition-colors duration-200
                `}
              >
                <span className="mr-3">🔍</span>
                Continue with Google
              </button>

              <button
                type="button"
                className={`
                  w-full flex items-center justify-center px-4 py-3
                  border border-[${shareupColors.lighterGray}]
                  rounded-lg
                  text-[${shareupColors.dark}] font-medium
                  hover:bg-[${shareupColors.aliceBlue}]
                  transition-colors duration-200
                `}
              >
                <span className="mr-3">📘</span>
                Continue with Facebook
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <span className={`text-[${shareupColors.dimGray}]`}>
                Don't have an account?{' '}
              </span>
              <button
                type="button"
                onClick={onSignUp}
                className={`
                  text-[${shareupColors.iondigoDye}] 
                  hover:underline font-semibold
                `}
              >
                Create new account
              </button>
            </div>
          </form>
        </ShareupCard>
      </div>
    </div>
  );
};
