'use client';

import React, { useState, useRef } from 'react';
import { ShareupLayout } from '@/components/layout/ShareupLayout';
import { ShareupButton } from '@/components/ui/ShareupButton';
import { ShareupCard } from '@/components/ui/ShareupCard';
import { ShareupInput } from '@/components/ui/ShareupInput';
import { shareupColors } from '@/styles/shareup-colors';
import { useRouter } from 'next/navigation';

interface UserProfile {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  website: string;
  location: string;
  dateOfBirth: string;
  profilePicture?: string;
  coverPhoto?: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const profileImageRef = useRef<HTMLInputElement>(null);
  const coverImageRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'Your',
    lastName: 'Name',
    username: 'yourname',
    email: 'your.email@example.com',
    phone: '+90 555 123 4567',
    bio: 'ShareUpTime kullanıcısı 🚀 Teknoloji ve sosyal medya tutkunu 💻 #ShareUpTime',
    website: 'https://yourwebsite.com',
    location: 'Istanbul, Turkey',
    dateOfBirth: '1990-01-01',
  });

  const [errors, setErrors] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'basic' | 'contact' | 'about'>('basic');

  const validateForm = () => {
    const newErrors: Partial<UserProfile> = {};

    if (!profile.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!profile.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!profile.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (profile.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(profile.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (profile.website && !/^https?:\/\/.+/.test(profile.website)) {
      newErrors.website = 'Website must be a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Profile updated:', profile);
      router.push('/profile');
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageUpload = (type: 'profile' | 'cover', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'profile') {
          setProfile(prev => ({ ...prev, profilePicture: result }));
        } else {
          setProfile(prev => ({ ...prev, coverPhoto: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <ShareupLayout currentPath="/edit-profile">
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-shareup-dark">Edit Profile</h1>
              <p className="text-shareup-gray">Update your profile information</p>
            </div>
            <div className="flex space-x-3">
              <ShareupButton
                title="Cancel"
                onPress={() => router.back()}
                variant="secondary"
                size="medium"
              />
              <ShareupButton
                title="Save Changes"
                onPress={handleSave}
                variant="primary"
                size="medium"
                loading={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <ShareupCard>
                <h3 className="font-semibold text-shareup-dark mb-4">Sections</h3>
                <div className="space-y-2">
                  {[
                    { key: 'basic', label: 'Basic Info', icon: '👤' },
                    { key: 'contact', label: 'Contact', icon: '📞' },
                    { key: 'about', label: 'About', icon: '📝' },
                  ].map((section) => (
                    <button
                      key={section.key}
                      onClick={() => setActiveSection(section.key as any)}
                      className={`
                        w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors
                        ${activeSection === section.key
                          ? 'bg-shareup-primary text-white'
                          : 'text-shareup-gray hover:bg-shareup-light'
                        }
                      `}
                    >
                      <span>{section.icon}</span>
                      <span className="font-medium">{section.label}</span>
                    </button>
                  ))}
                </div>
              </ShareupCard>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Photos */}
              <ShareupCard>
                <h3 className="text-lg font-semibold text-shareup-dark mb-4">Profile Photos</h3>
                
                {/* Cover Photo */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-shareup-dark mb-2">
                    Cover Photo
                  </label>
                  <div 
                    className="relative h-48 bg-gradient-to-r from-shareup-gradient-start to-shareup-gradient-end rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => coverImageRef.current?.click()}
                  >
                    {profile.coverPhoto && (
                      <img 
                        src={profile.coverPhoto} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-center text-white">
                        <span className="block text-2xl mb-2">📷</span>
                        <span className="font-medium">Change Cover Photo</span>
                      </div>
                    </div>
                  </div>
                  <input
                    ref={coverImageRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('cover', e)}
                    className="hidden"
                  />
                </div>

                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium text-shareup-dark mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div 
                      className="relative w-24 h-24 rounded-full bg-shareup-profile cursor-pointer group"
                      onClick={() => profileImageRef.current?.click()}
                    >
                      {profile.profilePicture ? (
                        <img 
                          src={profile.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-shareup-profile flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {profile.firstName[0]}{profile.lastName[0]}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xl">📷</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-shareup-gray mb-2">
                        Upload a new profile picture. Recommended size: 400x400px
                      </p>
                      <ShareupButton
                        title="Upload Photo"
                        onPress={() => profileImageRef.current?.click()}
                        variant="secondary"
                        size="small"
                      />
                    </div>
                  </div>
                  <input
                    ref={profileImageRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('profile', e)}
                    className="hidden"
                  />
                </div>
              </ShareupCard>

              {/* Basic Information */}
              {activeSection === 'basic' && (
                <ShareupCard>
                  <h3 className="text-lg font-semibold text-shareup-dark mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ShareupInput
                        placeholder="First Name"
                        value={profile.firstName}
                        onChangeText={(text) => updateProfile('firstName', text)}
                        error={errors.firstName}
                        label="First Name"
                      />
                      <ShareupInput
                        placeholder="Last Name"
                        value={profile.lastName}
                        onChangeText={(text) => updateProfile('lastName', text)}
                        error={errors.lastName}
                        label="Last Name"
                      />
                    </div>
                    <ShareupInput
                      placeholder="Username"
                      value={profile.username}
                      onChangeText={(text) => updateProfile('username', text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      error={errors.username}
                      label="Username"
                      icon="@"
                    />
                    <div>
                      <label className="block text-sm font-medium text-shareup-dark mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={profile.dateOfBirth}
                        onChange={(e) => updateProfile('dateOfBirth', e.target.value)}
                        className="w-full px-4 py-3 border border-shareup-lighter-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-shareup-primary"
                      />
                    </div>
                  </div>
                </ShareupCard>
              )}

              {/* Contact Information */}
              {activeSection === 'contact' && (
                <ShareupCard>
                  <h3 className="text-lg font-semibold text-shareup-dark mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <ShareupInput
                      placeholder="Email Address"
                      value={profile.email}
                      onChangeText={(text) => updateProfile('email', text)}
                      error={errors.email}
                      keyboardType="email-address"
                      label="Email"
                    />
                    <ShareupInput
                      placeholder="Phone Number"
                      value={profile.phone}
                      onChangeText={(text) => updateProfile('phone', text)}
                      error={errors.phone}
                      keyboardType="phone-pad"
                      label="Phone"
                    />
                    <ShareupInput
                      placeholder="Website URL"
                      value={profile.website}
                      onChangeText={(text) => updateProfile('website', text)}
                      error={errors.website}
                      label="Website"
                    />
                    <ShareupInput
                      placeholder="Location"
                      value={profile.location}
                      onChangeText={(text) => updateProfile('location', text)}
                      label="Location"
                      icon="📍"
                    />
                  </div>
                </ShareupCard>
              )}

              {/* About */}
              {activeSection === 'about' && (
                <ShareupCard>
                  <h3 className="text-lg font-semibold text-shareup-dark mb-4">About You</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-shareup-dark mb-2">
                        Bio
                      </label>
                      <textarea
                        placeholder="Tell people about yourself..."
                        value={profile.bio}
                        onChange={(e) => updateProfile('bio', e.target.value)}
                        rows={4}
                        maxLength={160}
                        className="w-full px-4 py-3 border border-shareup-lighter-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-shareup-primary resize-none"
                      />
                      <p className="text-xs text-shareup-gray mt-1">
                        {profile.bio.length}/160 characters
                      </p>
                    </div>
                  </div>
                </ShareupCard>
              )}

              {/* Privacy Settings */}
              <ShareupCard>
                <h3 className="text-lg font-semibold text-shareup-dark mb-4">Privacy Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-shareup-dark">Private Account</h4>
                      <p className="text-sm text-shareup-gray">Only approved followers can see your posts</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-shareup-dark">Show Activity Status</h4>
                      <p className="text-sm text-shareup-gray">Let others see when you're active</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-shareup-primary transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                </div>
              </ShareupCard>
            </div>
          </div>
        </div>
      </div>
    </ShareupLayout>
  );
}
