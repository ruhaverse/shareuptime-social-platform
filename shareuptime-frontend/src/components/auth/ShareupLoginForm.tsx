'use client';

import React, { useState } from 'react';
import { ShareupButton } from '@/components/ui/ShareupButton';
import { ShareupInput } from '@/components/ui/ShareupInput';
import { ShareupCard } from '@/components/ui/ShareupCard';
import { shareupColors } from '@/styles/shareup-colors';
import { AuthAPI } from '@/services/api';

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

  // Unified login action used by both form submit and button onPress
  const doLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setGeneralError('');
    try {
      await AuthAPI.login({ email: formData.email, password: formData.password });
      onSuccess?.();
    } catch (error: any) {
      setGeneralError(error?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    await doLogin();
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
            <span className={`text-4xl font-bold text-shareup-primary`}>
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
                bg-shareup-red/10 
                border border-shareup-red/20
                text-shareup-red 
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
                  text-sm text-shareup-primary 
                  hover:underline font-semibold
                `}
              >
                Forgot Password?
              </button>
            </div>

            <ShareupButton
              title="Share in"
              onPress={() => { void doLogin(); }}
              loading={loading}
              className="w-full"
              size="large"
            />

            {/* Alternative Login Options */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t border-shareup-lighter-gray`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 bg-white text-shareup-dim-gray`}>
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
                  border border-shareup-lighter-gray
                  rounded-lg
                  text-shareup-dark font-medium
                  hover:bg-shareup-light
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
                  border border-shareup-lighter-gray
                  rounded-lg
                  text-shareup-dark font-medium
                  hover:bg-shareup-light
                  transition-colors duration-200
                `}
              >
                <span className="mr-3">📘</span>
                Continue with Facebook
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <span className={`text-shareup-dim-gray`}>
                Don't have an account?{' '}
              </span>
              <button
                type="button"
                onClick={onSignUp}
                className={`
                  text-shareup-primary 
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
