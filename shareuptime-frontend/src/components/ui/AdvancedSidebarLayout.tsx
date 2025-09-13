'use client';

import React, { useState } from 'react';
import { shareupColors } from '@/styles/shareup-colors';
import { 
  Home, 
  Users, 
  MessageCircle, 
  UserPlus, 
  Share2, 
  RefreshCw, 
  Bookmark,
  TrendingUp,
  Play,
  Calendar,
  Settings
} from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  url: string;
  image?: string;
}

interface AdvancedSidebarLayoutProps {
  user: User;
  children: React.ReactNode;
  currentPath?: string;
  newsItems?: NewsItem[];
  onCreateReel?: () => void;
}

export const AdvancedSidebarLayout: React.FC<AdvancedSidebarLayoutProps> = ({
  user,
  children,
  currentPath = '/',
  newsItems = [],
  onCreateReel
}) => {
  const [activeTab, setActiveTab] = useState(currentPath);

  const navigationItems = [
    { path: '/feed', icon: Home, label: 'ShareFeed' },
    { path: '/saved', icon: Bookmark, label: 'SavedShares' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/friends', icon: Users, label: 'ShareFriends' },
    { path: '/add-friends', icon: UserPlus, label: 'Add Friends' },
    { path: '/groups', icon: Users, label: 'ShareGroups' },
    { path: '/share', icon: Share2, label: 'SharePoint' },
    { path: '/swap', icon: RefreshCw, label: 'SwapPoint' },
  ];

  const defaultNews: NewsItem[] = [
    {
      id: '1',
      title: 'Omicron variant of COVID-19: New travel guidelines to come into force from December 1',
      source: 'Aljazeera Qatar News',
      date: '12/1/2021',
      url: 'https://www.aljazeera.com/where/qatar/',
      image: '/api/placeholder/300/200'
    },
    {
      id: '2',
      title: 'Prime Minister Scott Morrison says big tech firms have responsibility to ensure their platforms are safe.',
      source: 'Technology',
      date: '12/1/2021',
      url: 'https://www.theverge.com/tech'
    },
    {
      id: '3',
      title: 'Comprehensive Guide to Qatar Business....',
      source: 'Business',
      date: '12/1/2021',
      url: 'https://thepeninsulaqatar.com/category/Qatar-Business'
    },
    {
      id: '4',
      title: 'The #FIFArabCup Qatar 2021 kicks off today, coinciding with the inauguration of Al Bayt Stadium',
      source: 'Sports',
      date: '12/1/2021',
      url: 'https://www.dohanews.co/category/sports/'
    }
  ];

  const displayNews = newsItems.length > 0 ? newsItems : defaultNews;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex gap-6 py-6">
          {/* Left Sidebar */}
          <div className="w-80 space-y-6">
            {/* User Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-4">
                <img
                  src={user.profilePicture || '/api/placeholder/64/64'}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-gray-500 text-sm">@{user.firstName.toLowerCase()}</p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.path;
                  
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      onClick={() => setActiveTab(item.path)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Trending News */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">What's Trending</h3>
              </div>
              
              <div className="space-y-4">
                {displayNews.map((news) => (
                  <div key={news.id} className="group">
                    <div className="flex space-x-3">
                      {news.image && (
                        <img
                          src={news.image}
                          alt={news.title}
                          className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {news.title}
                        </h4>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-blue-500 font-medium">{news.source}</span>
                          <span className="text-xs text-gray-400">{news.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <a
                  href="https://www.aljazeera.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-sm text-blue-500 hover:text-blue-600 font-medium pt-2 border-t border-gray-100"
                >
                  Show More
                </a>
              </div>
            </div>

            {/* Reels Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Play className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-gray-900">Reels</h3>
              </div>
              
              <div className="space-y-3">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">What&apos;s happening in your world?</p>
                  </div>
                </div>
                
                <button
                  onClick={onCreateReel}
                  className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                >
                  Add Reel
                </button>
                
                <a
                  href="/reels"
                  className="block w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium text-center hover:bg-gray-200 transition-colors"
                >
                  Explore Reels
                </a>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>

          {/* Right Sidebar - Friends & Groups */}
          <div className="w-80 space-y-6">
            {/* Online Friends */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Online Friends</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={`/api/placeholder/32/32`}
                        alt="Friend"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Friend {i}</p>
                      <p className="text-xs text-gray-500">Online</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Groups */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Suggested Groups</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <img
                      src={`/api/placeholder/32/32`}
                      alt="Group"
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Group {i}</p>
                      <p className="text-xs text-gray-500">{Math.floor(Math.random() * 1000)} members</p>
                    </div>
                    <button className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors">
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar Widget */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-gray-900">Today</h3>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {new Date().getDate()}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
