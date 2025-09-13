'use client';

import React, { useState, useEffect } from 'react';
import { ShareupLayout } from '@/components/layout/ShareupLayout';
import { ShareupButton } from '@/components/ui/ShareupButton';
import { ShareupCard } from '@/components/ui/ShareupCard';
import { ShareupInput } from '@/components/ui/ShareupInput';
import { shareupColors } from '@/styles/shareup-colors';
import { useRouter } from 'next/navigation';

interface AccountSettings {
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showEmail: boolean;
    showPhone: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    loginAlerts: boolean;
  };
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    firstName: 'Your',
    lastName: 'Name',
    email: 'your.email@example.com',
    phone: '+90 555 123 4567',
    joinDate: '2024-01-15',
  });

  const [settings, setSettings] = useState<AccountSettings>({
    notifications: {
      push: true,
      email: true,
      sms: false,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
    },
  });

  const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'privacy' | 'security'>('profile');

  const handleLogout = () => {
    // Clear user session
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Handle account deletion
      console.log('Account deletion requested');
      handleLogout();
    }
  };

  const updateNotificationSetting = (key: keyof AccountSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const updatePrivacySetting = (key: keyof AccountSettings['privacy'], value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
  };

  const updateSecuritySetting = (key: keyof AccountSettings['security'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value,
      },
    }));
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ShareupLayout currentPath="/account">
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-shareup-dark mb-2">Account Settings</h1>
            <p className="text-shareup-gray">Manage your account preferences and settings</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-white rounded-lg p-1 border border-shareup-lighter-gray mb-6 overflow-x-auto">
            {[
              { key: 'profile', label: 'Profile', icon: '👤' },
              { key: 'notifications', label: 'Notifications', icon: '🔔' },
              { key: 'privacy', label: 'Privacy', icon: '🔒' },
              { key: 'security', label: 'Security', icon: '🛡️' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key as any)}
                className={`
                  flex items-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 whitespace-nowrap
                  ${activeSection === tab.key
                    ? 'bg-shareup-primary text-white shadow-sm'
                    : 'text-shareup-gray hover:bg-shareup-light'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <ShareupCard>
                  <h3 className="text-lg font-semibold text-shareup-dark mb-4">Profile Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ShareupInput
                        placeholder="First Name"
                        value={user.firstName}
                        onChangeText={(text) => setUser(prev => ({ ...prev, firstName: text }))}
                        label="First Name"
                      />
                      <ShareupInput
                        placeholder="Last Name"
                        value={user.lastName}
                        onChangeText={(text) => setUser(prev => ({ ...prev, lastName: text }))}
                        label="Last Name"
                      />
                    </div>
                    <ShareupInput
                      placeholder="Email"
                      value={user.email}
                      onChangeText={(text) => setUser(prev => ({ ...prev, email: text }))}
                      label="Email Address"
                      keyboardType="email-address"
                    />
                    <ShareupInput
                      placeholder="Phone"
                      value={user.phone}
                      onChangeText={(text) => setUser(prev => ({ ...prev, phone: text }))}
                      label="Phone Number"
                      keyboardType="phone-pad"
                    />
                    <div className="flex items-center justify-between pt-4">
                      <div>
                        <p className="text-sm text-shareup-gray">Member since</p>
                        <p className="font-medium text-shareup-dark">{formatJoinDate(user.joinDate)}</p>
                      </div>
                      <ShareupButton
                        title="Update Profile"
                        onPress={() => console.log('Update profile')}
                        variant="primary"
                        size="medium"
                      />
                    </div>
                  </div>
                </ShareupCard>

                <ShareupCard>
                  <h3 className="text-lg font-semibold text-shareup-dark mb-4">Account Actions</h3>
                  <div className="space-y-4">
                    <ShareupButton
                      title="Change Password"
                      onPress={() => router.push('/change-password')}
                      variant="secondary"
                      size="medium"
                      fullWidth
                    />
                    <ShareupButton
                      title="Download My Data"
                      onPress={() => console.log('Download data')}
                      variant="secondary"
                      size="medium"
                      fullWidth
                    />
                    <ShareupButton
                      title="Logout"
                      onPress={handleLogout}
                      variant="secondary"
                      size="medium"
                      fullWidth
                    />
                    <ShareupButton
                      title="Delete Account"
                      onPress={handleDeleteAccount}
                      variant="primary"
                      size="medium"
                      fullWidth
                      style={{ backgroundColor: '#ef4444' }}
                    />
                  </div>
                </ShareupCard>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <ShareupCard>
                <h3 className="text-lg font-semibold text-shareup-dark mb-4">Notification Preferences</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-shareup-dark">Push Notifications</h4>
                      <p className="text-sm text-shareup-gray">Receive notifications on your device</p>
                    </div>
                    <button
                      onClick={() => updateNotificationSetting('push', !settings.notifications.push)}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${settings.notifications.push ? 'bg-shareup-primary' : 'bg-gray-300'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${settings.notifications.push ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-shareup-dark">Email Notifications</h4>
                      <p className="text-sm text-shareup-gray">Receive notifications via email</p>
                    </div>
                    <button
                      onClick={() => updateNotificationSetting('email', !settings.notifications.email)}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${settings.notifications.email ? 'bg-shareup-primary' : 'bg-gray-300'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${settings.notifications.email ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-shareup-dark">SMS Notifications</h4>
                      <p className="text-sm text-shareup-gray">Receive notifications via SMS</p>
                    </div>
                    <button
                      onClick={() => updateNotificationSetting('sms', !settings.notifications.sms)}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${settings.notifications.sms ? 'bg-shareup-primary' : 'bg-gray-300'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${settings.notifications.sms ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                </div>
              </ShareupCard>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <ShareupCard>
                <h3 className="text-lg font-semibold text-shareup-dark mb-4">Privacy Settings</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-shareup-dark mb-2">Profile Visibility</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'public', label: 'Public', desc: 'Anyone can see your profile' },
                        { key: 'friends', label: 'Friends Only', desc: 'Only your friends can see your profile' },
                        { key: 'private', label: 'Private', desc: 'Only you can see your profile' },
                      ].map((option) => (
                        <label key={option.key} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="profileVisibility"
                            value={option.key}
                            checked={settings.privacy.profileVisibility === option.key}
                            onChange={(e) => updatePrivacySetting('profileVisibility', e.target.value)}
                            className="text-shareup-primary"
                          />
                          <div>
                            <p className="font-medium text-shareup-dark">{option.label}</p>
                            <p className="text-sm text-shareup-gray">{option.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-shareup-dark">Show Email Address</h4>
                      <p className="text-sm text-shareup-gray">Display your email on your profile</p>
                    </div>
                    <button
                      onClick={() => updatePrivacySetting('showEmail', !settings.privacy.showEmail)}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${settings.privacy.showEmail ? 'bg-shareup-primary' : 'bg-gray-300'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${settings.privacy.showEmail ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-shareup-dark">Show Phone Number</h4>
                      <p className="text-sm text-shareup-gray">Display your phone number on your profile</p>
                    </div>
                    <button
                      onClick={() => updatePrivacySetting('showPhone', !settings.privacy.showPhone)}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${settings.privacy.showPhone ? 'bg-shareup-primary' : 'bg-gray-300'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${settings.privacy.showPhone ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                </div>
              </ShareupCard>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <ShareupCard>
                <h3 className="text-lg font-semibold text-shareup-dark mb-4">Security Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-shareup-dark">Two-Factor Authentication</h4>
                      <p className="text-sm text-shareup-gray">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={() => updateSecuritySetting('twoFactorAuth', !settings.security.twoFactorAuth)}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${settings.security.twoFactorAuth ? 'bg-shareup-primary' : 'bg-gray-300'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-shareup-dark">Login Alerts</h4>
                      <p className="text-sm text-shareup-gray">Get notified when someone logs into your account</p>
                    </div>
                    <button
                      onClick={() => updateSecuritySetting('loginAlerts', !settings.security.loginAlerts)}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${settings.security.loginAlerts ? 'bg-shareup-primary' : 'bg-gray-300'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${settings.security.loginAlerts ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>

                  <div className="pt-4 border-t border-shareup-lighter-gray">
                    <h4 className="font-medium text-shareup-dark mb-4">Recent Login Activity</h4>
                    <div className="space-y-3">
                      {[
                        { device: 'Chrome on Windows', location: 'Istanbul, Turkey', time: '2 minutes ago', current: true },
                        { device: 'Mobile App', location: 'Istanbul, Turkey', time: '1 hour ago', current: false },
                        { device: 'Safari on Mac', location: 'Ankara, Turkey', time: '2 days ago', current: false },
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-shareup-dark flex items-center">
                              {activity.device}
                              {activity.current && (
                                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  Current
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-shareup-gray">{activity.location} • {activity.time}</p>
                          </div>
                          {!activity.current && (
                            <button className="text-shareup-red text-sm hover:underline">
                              Revoke
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ShareupCard>
            )}
          </div>
        </div>
      </div>
    </ShareupLayout>
  );
}
