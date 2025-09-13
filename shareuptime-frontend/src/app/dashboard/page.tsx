'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShareupFeed } from '@/components/feed/ShareupFeed';
import { ShareupButton } from '@/components/ui/ShareupButton';
import { shareupColors } from '@/styles/shareup-colors';
import { AuthService } from '@/lib/auth';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const authService = new AuthService();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userId = await authService.getCurrentUserId();
      if (!userId) {
        router.push('/login');
        return;
      }
      // Mock user data - replace with actual API call
      setUser({ 
        id: userId, 
        firstName: 'User', 
        lastName: 'Name' 
      });
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#044566]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className={`bg-white shadow-sm border-b border-[${shareupColors.lighterGray}]`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full 
                bg-[${shareupColors.iondigoDye}] 
                flex items-center justify-center
                mr-3
              `}>
                <span className="text-white font-bold text-lg">SU</span>
              </div>
              <h1 className={`text-xl font-bold text-[${shareupColors.dark}]`}>
                ShareUpTime
              </h1>
            </div>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-6">
              <button className={`
                text-[${shareupColors.dimGray}] 
                hover:text-[${shareupColors.iondigoDye}]
                font-medium transition-colors duration-200
              `}>
                🏠 Home
              </button>
              <button className={`
                text-[${shareupColors.dimGray}] 
                hover:text-[${shareupColors.iondigoDye}]
                font-medium transition-colors duration-200
              `}>
                👥 Friends
              </button>
              <button className={`
                text-[${shareupColors.dimGray}] 
                hover:text-[${shareupColors.iondigoDye}]
                font-medium transition-colors duration-200
              `}>
                💬 Messages
              </button>
              <button className={`
                text-[${shareupColors.dimGray}] 
                hover:text-[${shareupColors.iondigoDye}]
                font-medium transition-colors duration-200
              `}>
                🔔 Notifications
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`
                  w-8 h-8 rounded-full 
                  bg-[${shareupColors.profilePicture}] 
                  flex items-center justify-center
                `}>
                  <span className={`text-[${shareupColors.white}] text-sm font-semibold`}>
                    {user?.firstName?.[0] || 'U'}
                  </span>
                </div>
                <span className={`text-[${shareupColors.dark}] font-medium hidden sm:block`}>
                  {user?.firstName || 'User'}
                </span>
              </div>
              <ShareupButton
                title="Logout"
                onPress={handleLogout}
                variant="secondary"
                size="small"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className={`
              bg-white rounded-lg shadow-md p-6
              border border-[${shareupColors.lighterGray}]
            `}>
              <h3 className={`text-lg font-semibold text-[${shareupColors.dark}] mb-4`}>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className={`
                  w-full text-left px-4 py-3 rounded-lg
                  text-[${shareupColors.dimGray}] 
                  hover:bg-[${shareupColors.aliceBlue}]
                  transition-colors duration-200
                  flex items-center space-x-3
                `}>
                  <span>👤</span>
                  <span>Profile</span>
                </button>
                <button className={`
                  w-full text-left px-4 py-3 rounded-lg
                  text-[${shareupColors.dimGray}] 
                  hover:bg-[${shareupColors.aliceBlue}]
                  transition-colors duration-200
                  flex items-center space-x-3
                `}>
                  <span>⚙️</span>
                  <span>Settings</span>
                </button>
                <button className={`
                  w-full text-left px-4 py-3 rounded-lg
                  text-[${shareupColors.dimGray}] 
                  hover:bg-[${shareupColors.aliceBlue}]
                  transition-colors duration-200
                  flex items-center space-x-3
                `}>
                  <span>📊</span>
                  <span>Analytics</span>
                </button>
              </div>
            </div>

            {/* Trending Section */}
            <div className={`
              bg-white rounded-lg shadow-md p-6 mt-6
              border border-[${shareupColors.lighterGray}]
            `}>
              <h3 className={`text-lg font-semibold text-[${shareupColors.dark}] mb-4`}>
                Trending
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[${shareupColors.dimGray}]`}>#ShareUpTime</span>
                  <span className={`text-sm text-[${shareupColors.activeGreen}]`}>+12%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[${shareupColors.dimGray}]`}>#SocialMedia</span>
                  <span className={`text-sm text-[${shareupColors.activeGreen}]`}>+8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[${shareupColors.dimGray}]`}>#Technology</span>
                  <span className={`text-sm text-[${shareupColors.activeGreen}]`}>+5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2">
            <ShareupFeed />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className={`
              bg-white rounded-lg shadow-md p-6
              border border-[${shareupColors.lighterGray}]
            `}>
              <h3 className={`text-lg font-semibold text-[${shareupColors.dark}] mb-4`}>
                Suggested Friends
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Ali Veli', mutualFriends: 5 },
                  { name: 'Ayşe Fatma', mutualFriends: 3 },
                  { name: 'Can Demir', mutualFriends: 8 }
                ].map((friend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-10 h-10 rounded-full 
                        bg-[${shareupColors.profilePicture}] 
                        flex items-center justify-center
                      `}>
                        <span className={`text-[${shareupColors.white}] text-sm font-semibold`}>
                          {friend.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className={`text-sm font-medium text-[${shareupColors.dark}]`}>
                          {friend.name}
                        </p>
                        <p className={`text-xs text-[${shareupColors.dimGray}]`}>
                          {friend.mutualFriends} mutual friends
                        </p>
                      </div>
                    </div>
                    <ShareupButton
                      title="Add"
                      onPress={() => console.log('Add friend:', friend.name)}
                      variant="primary"
                      size="small"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Online Friends */}
            <div className={`
              bg-white rounded-lg shadow-md p-6 mt-6
              border border-[${shareupColors.lighterGray}]
            `}>
              <h3 className={`text-lg font-semibold text-[${shareupColors.dark}] mb-4`}>
                Online Now
              </h3>
              <div className="space-y-3">
                {[
                  'Mehmet Yılmaz',
                  'Zeynep Kaya', 
                  'Ahmet Demir'
                ].map((friend, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="relative">
                      <div className={`
                        w-8 h-8 rounded-full 
                        bg-[${shareupColors.profilePicture}] 
                        flex items-center justify-center
                      `}>
                        <span className={`text-[${shareupColors.white}] text-xs font-semibold`}>
                          {friend.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className={`
                        absolute -bottom-1 -right-1 
                        w-3 h-3 rounded-full 
                        bg-[${shareupColors.activeGreen}]
                        border-2 border-white
                      `}></div>
                    </div>
                    <span className={`text-sm text-[${shareupColors.dark}]`}>
                      {friend}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
