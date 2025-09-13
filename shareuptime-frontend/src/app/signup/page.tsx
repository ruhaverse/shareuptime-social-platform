'use client';

import React, { useState } from 'react';
import { ShareupButton } from '@/components/ui/ShareupButton';
import { ShareupInput } from '@/components/ui/ShareupInput';
import { ShareupCard } from '@/components/ui/ShareupCard';
import { shareupColors } from '@/styles/shareup-colors';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SignUpForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  dateOfBirth: string;
  agreeToTerms: boolean;
}

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignUpForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Partial<SignUpForm>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const validateForm = () => {
    const newErrors: Partial<SignUpForm> = {};

    if (step === 1) {
      if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!form.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!form.password) {
        newErrors.password = 'Password is required';
      } else if (form.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else {
      if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!form.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!form.agreeToTerms) newErrors.agreeToTerms = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful signup
      console.log('Sign up successful:', form);
      router.push('/signup-verification');
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateForm = (field: keyof SignUpForm, value: string | boolean) => {
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
          <p className="text-white/80">Join the community</p>
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
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-shareup-dark mb-6 text-center">
                Create Account
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <ShareupInput
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={(value) => updateForm('firstName', value)}
                    error={errors.firstName}
                  />
                  <ShareupInput
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={(value) => updateForm('lastName', value)}
                    error={errors.lastName}
                  />
                </div>

                <ShareupInput
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(value) => updateForm('email', value)}
                  error={errors.email}
                  type="email"
                />

                <ShareupInput
                  placeholder="Password"
                  value={form.password}
                  onChange={(value) => updateForm('password', value)}
                  error={errors.password}
                  type="password"
                />

                <ShareupInput
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={(value) => updateForm('confirmPassword', value)}
                  error={errors.confirmPassword}
                  type="password"
                />

                <ShareupButton
                  title="Next"
                  onPress={handleNext}
                  variant="primary"
                  size="large"
                  className="w-full"
                />
              </div>
            </>
          )}

          {/* Step 2: Additional Information */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold text-shareup-dark mb-6 text-center">
                Complete Profile
              </h2>

              <div className="space-y-4">
                <ShareupInput
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(value) => updateForm('phone', value)}
                  error={errors.phone}
                />

                <div>
                  <label className="block text-sm font-medium text-shareup-dark mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => updateForm('dateOfBirth', e.target.value)}
                    className={`
                      w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-shareup-primary
                      ${errors.dateOfBirth ? 'border-red-500' : 'border-shareup-lighter-gray'}
                    `}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={form.agreeToTerms}
                    onChange={(e) => updateForm('agreeToTerms', e.target.checked)}
                    className="mt-1 text-shareup-primary focus:ring-shareup-primary"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-shareup-gray">
                    I agree to the{' '}
                    <Link href="/terms" className="text-shareup-primary hover:underline">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-shareup-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>
                )}

                <div className="flex space-x-4">
                  <ShareupButton
                    title="Back"
                    onPress={handleBack}
                    variant="secondary"
                    size="large"
                    className="w-full"
                  />
                  <ShareupButton
                    title="Create Account"
                    onPress={handleSignUp}
                    variant="primary"
                    size="large"
                    className="w-full"
                    loading={isLoading}
                  />
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-shareup-gray">
              Already have an account?{' '}
              <Link href="/login" className="text-shareup-primary hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </ShareupCard>

        {/* Alternative Sign Up Options */}
        <ShareupCard className="mt-4">
          <div className="text-center">
            <p className="text-shareup-gray mb-4">Or sign up with</p>
            <div className="flex space-x-4">
              <button className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 border border-shareup-lighter-gray rounded-lg hover:bg-shareup-light transition-colors">
                <span className="text-xl">📧</span>
                <span className="font-medium text-shareup-dark">Google</span>
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 border border-shareup-lighter-gray rounded-lg hover:bg-shareup-light transition-colors">
                <span className="text-xl">📘</span>
                <span className="font-medium text-shareup-dark">Facebook</span>
              </button>
            </div>
          </div>
        </ShareupCard>

        {/* Terms Notice */}
        <div className="mt-6 text-center">
          <p className="text-white/60 text-xs">
            By signing up, you agree to our Terms of Service and Privacy Policy.
            We'll occasionally send you account-related emails.
          </p>
        </div>
      </div>
    </div>
  );
}
