'use client';

import React, { useState, useEffect } from 'react';
import { shareupColors } from '@/styles/shareup-colors';
import { TrendingUp, ExternalLink, Clock, Globe } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  url: string;
  image?: string;
  category?: string;
}

interface AdvancedNewsWidgetProps {
  newsItems?: NewsItem[];
  maxItems?: number;
  showImages?: boolean;
  className?: string;
}

export const AdvancedNewsWidget: React.FC<AdvancedNewsWidgetProps> = ({
  newsItems = [],
  maxItems = 5,
  showImages = true,
  className = ''
}) => {
  const [displayItems, setDisplayItems] = useState<NewsItem[]>([]);

  const defaultNews: NewsItem[] = [
    {
      id: '1',
      title: 'New Social Media Trends Reshaping Digital Communication in 2024',
      source: 'Tech Today',
      date: new Date().toLocaleDateString(),
      url: '#',
      image: '/api/placeholder/300/200',
      category: 'Technology'
    },
    {
      id: '2',
      title: 'ShareUp Platform Introduces Revolutionary Features for Better User Experience',
      source: 'Social Media News',
      date: new Date().toLocaleDateString(),
      url: '#',
      category: 'Platform Updates'
    },
    {
      id: '3',
      title: 'Digital Privacy: What Users Need to Know About Data Protection',
      source: 'Privacy Watch',
      date: new Date().toLocaleDateString(),
      url: '#',
      category: 'Privacy'
    },
    {
      id: '4',
      title: 'The Future of Social Networking: AI and Personalization',
      source: 'Future Tech',
      date: new Date().toLocaleDateString(),
      url: '#',
      category: 'AI & Tech'
    },
    {
      id: '5',
      title: 'Community Building in the Digital Age: Best Practices',
      source: 'Community Hub',
      date: new Date().toLocaleDateString(),
      url: '#',
      category: 'Community'
    }
  ];

  useEffect(() => {
    const items = newsItems.length > 0 ? newsItems : defaultNews;
    setDisplayItems(items.slice(0, maxItems));
  }, [newsItems, maxItems]);

  const getCategoryColor = (category?: string) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-700',
      'Platform Updates': 'bg-green-100 text-green-700',
      'Privacy': 'bg-red-100 text-red-700',
      'AI & Tech': 'bg-purple-100 text-purple-700',
      'Community': 'bg-orange-100 text-orange-700',
      'default': 'bg-gray-100 text-gray-700'
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900">Trending News</h3>
        </div>
        <Globe className="w-4 h-4 text-gray-400" />
      </div>

      {/* News Items */}
      <div className="space-y-4">
        {displayItems.map((item, index) => (
          <article key={item.id} className="group cursor-pointer">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="flex space-x-3">
                {/* Image */}
                {showImages && item.image && (
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-16 rounded-lg object-cover group-hover:opacity-90 transition-opacity"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Category Badge */}
                  {item.category && (
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  )}

                  {/* Title */}
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 mb-2">
                    {item.title}
                  </h4>

                  {/* Meta Information */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-blue-500">{item.source}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(item.date)}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

              {/* Separator */}
              {index < displayItems.length - 1 && (
                <div className="border-b border-gray-100 mt-4"></div>
              )}
            </a>
          </article>
        ))}
      </div>

      {/* Show More Link */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <a
          href="/news"
          className="block text-center text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
        >
          View All News
        </a>
      </div>

      {/* Live Indicator */}
      <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Live updates</span>
      </div>
    </div>
  );
};
