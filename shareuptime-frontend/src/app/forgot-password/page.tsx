'use client';

import React, { useState } from 'react';
import { ShareupButton } from '@/components/ui/ShareupButton';
import { ShareupInput } from '@/components/ui/ShareupInput';
import { ShareupCard } from '@/components/ui/ShareupCard';
import { shareupColors } from '@/styles/shareup-colors';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ForgotPasswordForm {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState<ForgotPasswordForm>({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<ForgotPasswordForm>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [countdown, setCountdown] = useState(0);

  const validateEmail = () => {
    const newErrors: Partial<ForgotPasswordForm> = {};
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = () => {
    const newErrors: Partial<ForgotPasswordForm> = {};
    
    if (!form.otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (form.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: Partial<ForgotPasswordForm> = {};
    
    if (!form.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (form.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('OTP sent to:', form.email);
      setStep(2);
      startCountdown();
    } catch (error) {
      console.error('Send OTP error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!validateOTP()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('OTP verified:', form.otp);
      setStep(3);
    } catch (error) {
      console.error('Verify OTP error:', error);
      setErrors({ otp: 'Invalid OTP. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Password reset successful');
      router.push('/login?message=Password reset successful');
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOTP = () => {
    if (countdown === 0) {
      handleSendOTP();
    }
  };

  const updateForm = (field: keyof ForgotPasswordForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-shareup-gradient-start to-shareup-gradient-end flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">ShareUpTime</h1>
          <p className="text-white/80">Reset your password</p>
        </div>

        <ShareupCard>
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 1 ? 'bg-shareup-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <div className={`w-8 h-1 ${step >= 2 ? 'bg-shareup-primary' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 2 ? 'bg-shareup-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <div className={`w-8 h-1 ${step >= 3 ? 'bg-shareup-primary' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 3 ? 'bg-shareup-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <>
              <div className="text-center mb-6">
                <span className="text-6xl mb-4 block">🔐</span>
                <h2 className="text-2xl font-bold text-shareup-dark mb-2">
                  Forgot Password?
                </h2>
                <p className="text-shareup-gray">
                  Enter your email address and we'll send you a code to reset your password.
                </p>
              </div>

              <div className="space-y-4">
                <ShareupInput
                  placeholder="Email Address"
                  value={form.email}
                  onChangeText={(text) => updateForm('email', text)}
                  error={errors.email}
                  keyboardType="email-address"
                  label="Email"
                />

                <ShareupButton
                  title="Send Reset Code"
                  onPress={handleSendOTP}
                  variant="primary"
                  size="large"
                  fullWidth
                  loading={isLoading}
                />
              </div>
            </>
          )}

          {/* Step 2: Enter OTP */}
          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <span className="text-6xl mb-4 block">📧</span>
                <h2 className="text-2xl font-bold text-shareup-dark mb-2">
                  Enter Verification Code
                </h2>
                <p className="text-shareup-gray">
                  We've sent a 6-digit code to <strong>{form.email}</strong>
                </p>
              </div>

              <div className="space-y-4">
                <ShareupInput
                  placeholder="Enter 6-digit code"
                  value={form.otp}
                  onChangeText={(text) => updateForm('otp', text.replace(/\D/g, '').slice(0, 6))}
                  error={errors.otp}
                  keyboardType="numeric"
                  label="Verification Code"
                  maxLength={6}
                />

                <ShareupButton
                  title="Verify Code"
                  onPress={handleVerifyOTP}
                  variant="primary"
                  size="large"
                  fullWidth
                  loading={isLoading}
                />

                <div className="text-center">
                  <p className="text-shareup-gray text-sm">
                    Didn't receive the code?{' '}
                    {countdown > 0 ? (
                      <span className="text-shareup-primary">
                        Resend in {countdown}s
                      </span>
                    ) : (
                      <button
                        onClick={handleResendOTP}
                        className="text-shareup-primary hover:underline font-semibold"
                      >
                        Resend Code
                      </button>
                    )}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <>
              <div className="text-center mb-6">
                <span className="text-6xl mb-4 block">🔑</span>
                <h2 className="text-2xl font-bold text-shareup-dark mb-2">
                  Create New Password
                </h2>
                <p className="text-shareup-gray">
                  Your new password must be different from your previous password.
                </p>
              </div>

              <div className="space-y-4">
                <ShareupInput
                  placeholder="New Password"
                  value={form.newPassword}
                  onChangeText={(text) => updateForm('newPassword', text)}
                  error={errors.newPassword}
                  secureTextEntry
                  label="New Password"
                />

                <ShareupInput
                  placeholder="Confirm New Password"
                  value={form.confirmPassword}
                  onChangeText={(text) => updateForm('confirmPassword', text)}
                  error={errors.confirmPassword}
                  secureTextEntry
                  label="Confirm Password"
                />

                <ShareupButton
                  title="Reset Password"
                  onPress={handleResetPassword}
                  variant="primary"
                  size="large"
                  fullWidth
                  loading={isLoading}
                />
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-shareup-gray">
              Remember your password?{' '}
              <Link href="/login" className="text-shareup-primary hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </ShareupCard>

        {/* Security Notice */}
        <ShareupCard className="mt-4">
          <div className="text-center">
            <h3 className="font-semibold text-shareup-dark mb-2">🛡️ Security Notice</h3>
            <p className="text-shareup-gray text-sm">
              For your security, the reset code will expire in 10 minutes. 
              If you didn't request this reset, please ignore this message.
            </p>
          </div>
        </ShareupCard>

        {/* Help */}
        <div className="mt-6 text-center">
          <p className="text-white/60 text-xs">
            Need help?{' '}
            <Link href="/support" className="text-white hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
