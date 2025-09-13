'use client';

import React, { useState } from 'react';
import { shareupColors } from '@/styles/shareup-colors';

interface GiphyGif {
  id: string;
  url: string;
  title: string;
  images: {
    fixed_height: {
      url: string;
      width: string;
      height: string;
    };
    original: {
      url: string;
      width: string;
      height: string;
    };
  };
}

interface ShareupGiphyPickerProps {
  onGifSelect: (gif: GiphyGif) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareupGiphyPicker: React.FC<ShareupGiphyPickerProps> = ({
  onGifSelect,
  isOpen,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock trending GIFs for demo
  const trendingGifs: GiphyGif[] = [
    {
      id: '1',
      url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
      title: 'Happy Dance',
      images: {
        fixed_height: {
          url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/200.gif',
          width: '200',
          height: '200'
        },
        original: {
          url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
          width: '480',
          height: '480'
        }
      }
    },
    {
      id: '2',
      url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
      title: 'Thumbs Up',
      images: {
        fixed_height: {
          url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/200.gif',
          width: '200',
          height: '200'
        },
        original: {
          url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
          width: '480',
          height: '480'
        }
      }
    }
  ];

  const searchGifs = async (query: string) => {
    if (!query.trim()) {
      setGifs(trendingGifs);
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, you would use Giphy API here
      // For demo purposes, we'll filter trending gifs
      const filtered = trendingGifs.filter(gif => 
        gif.title.toLowerCase().includes(query.toLowerCase())
      );
      setGifs(filtered);
    } catch (error) {
      setGifs([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      setGifs(trendingGifs);
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchGifs(searchQuery);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 w-96 z-50">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-shareup-dark">Choose GIF</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search GIFs..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-shareup-primary"
          />
        </form>

        {/* GIF Grid */}
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="col-span-2 flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-shareup-primary"></div>
            </div>
          ) : gifs.length > 0 ? (
            gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => {
                  onGifSelect(gif);
                  onClose();
                }}
                className="relative overflow-hidden rounded-lg hover:opacity-80 transition-opacity"
              >
                <img
                  src={gif.images.fixed_height.url}
                  alt={gif.title}
                  className="w-full h-24 object-cover"
                />
              </button>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-gray-500">
              {searchQuery ? 'No GIFs found' : 'No trending GIFs available'}
            </div>
          )}
        </div>

        <div className="mt-3 text-xs text-gray-400 text-center">
          Powered by GIPHY
        </div>
      </div>
    </div>
  );
};
