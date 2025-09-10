'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Share2, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { authService } from '@/lib/auth';
import apiClient from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Post {
  id: string;
  username: string;
  fullName: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  timestamp: string;
  isLiked: boolean;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    loadFeed();
  }, [router]);

  const loadFeed = async () => {
    try {
      // Mock data - gerçek API'den gelecek
      const mockPosts: Post[] = [
        {
          id: '1',
          username: 'ahmet_yilmaz',
          fullName: 'Ahmet Yılmaz',
          content: 'Bugün harika bir gün! ShareUpTime platformunu test ediyorum. 🚀',
          likes: 12,
          comments: 3,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isLiked: false,
        },
        {
          id: '2',
          username: 'ayse_kara',
          fullName: 'Ayşe Kara',
          content: 'Yeni projemde React Native kullanıyorum. Çok keyifli! 📱',
          likes: 8,
          comments: 1,
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          isLiked: true,
        },
      ];
      
      setPosts(mockPosts);
    } catch (error) {
      console.error('Feed yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    );
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">ShareUpTime</h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/create-post')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Paylaş
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              Çıkış
            </Button>
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm border p-6">
              {/* Post Header */}
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {post.fullName.charAt(0)}
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">{post.fullName}</h3>
                  <p className="text-sm text-gray-500">@{post.username} • {formatDate(post.timestamp)}</p>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-gray-900 leading-relaxed">{post.content}</p>
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Post image"
                    className="mt-3 rounded-lg w-full max-h-96 object-cover"
                  />
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    post.isLiked
                      ? 'text-red-600 bg-red-50 hover:bg-red-100'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{post.likes}</span>
                </button>

                <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">{post.comments}</span>
                </button>

                <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">
                  <Share2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Paylaş</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Henüz gönderi yok.</p>
            <Button
              className="mt-4"
              onClick={() => router.push('/create-post')}
            >
              İlk gönderini paylaş
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
