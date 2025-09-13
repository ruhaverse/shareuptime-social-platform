'use client';

import React, { useState, useEffect } from 'react';
import { ShareupLayout } from '@/components/layout/ShareupLayout';
import { ShareupButton } from '@/components/ui/ShareupButton';
import { ShareupCard } from '@/components/ui/ShareupCard';
import { ShareupInput } from '@/components/ui/ShareupInput';
import { shareupColors } from '@/styles/shareup-colors';
import { useRouter, useParams } from 'next/navigation';

interface Comment {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface Post {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  content: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  images?: string[];
}

export default function CommentsPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.postId as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data
  const mockPost: Post = {
    id: postId,
    user: {
      id: '1',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
    },
    content: 'ShareUpTime ile harika deneyimler yaşıyorum! Yeni özellikler gerçekten etkileyici. 🚀',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    likesCount: 45,
    commentsCount: 12,
  };

  const mockComments: Comment[] = [
    {
      id: '1',
      user: {
        id: '2',
        firstName: 'Zeynep',
        lastName: 'Kaya',
      },
      content: 'Harika paylaşım! Ben de çok beğendim 👏',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      likesCount: 8,
      isLiked: false,
      replies: [
        {
          id: '1-1',
          user: {
            id: '1',
            firstName: 'Ahmet',
            lastName: 'Yılmaz',
          },
          content: 'Teşekkürler Zeynep! 😊',
          createdAt: new Date(Date.now() - 1500000).toISOString(),
          likesCount: 2,
          isLiked: true,
        },
      ],
    },
    {
      id: '2',
      user: {
        id: '3',
        firstName: 'Mehmet',
        lastName: 'Demir',
      },
      content: 'Bende kullanmaya başladım, gerçekten çok iyi bir platform 🎉',
      createdAt: new Date(Date.now() - 1200000).toISOString(),
      likesCount: 5,
      isLiked: true,
    },
    {
      id: '3',
      user: {
        id: '4',
        firstName: 'Ayşe',
        lastName: 'Özkan',
      },
      content: 'Hangi özelliği en çok beğendin?',
      createdAt: new Date(Date.now() - 900000).toISOString(),
      likesCount: 1,
      isLiked: false,
    },
  ];

  useEffect(() => {
    setPost(mockPost);
    setComments(mockComments);
  }, [postId]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const comment: Comment = {
        id: Date.now().toString(),
        user: {
          id: 'current-user',
          firstName: 'Your',
          lastName: 'Name',
        },
        content: newComment,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        isLiked: false,
      };

      setComments(prev => [comment, ...prev]);
      setNewComment('');
      
      // Update post comments count
      if (post) {
        setPost(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null);
      }
    } catch (error) {
      console.error('Add comment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!replyText.trim()) return;

    setIsLoading(true);
    try {
      const reply: Comment = {
        id: `${commentId}-${Date.now()}`,
        user: {
          id: 'current-user',
          firstName: 'Your',
          lastName: 'Name',
        },
        content: replyText,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        isLiked: false,
      };

      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: [...(comment.replies || []), reply] }
          : comment
      ));
      
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Add reply error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeComment = (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (isReply && parentId) {
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? {
              ...comment,
              replies: comment.replies?.map(reply =>
                reply.id === commentId
                  ? {
                      ...reply,
                      isLiked: !reply.isLiked,
                      likesCount: reply.isLiked ? reply.likesCount - 1 : reply.likesCount + 1,
                    }
                  : reply
              ),
            }
          : comment
      ));
    } else {
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likesCount: comment.isLiked ? comment.likesCount - 1 : comment.likesCount + 1,
            }
          : comment
      ));
    }
  };

  const CommentItem = ({ comment, isReply = false, parentId }: { comment: Comment; isReply?: boolean; parentId?: string }) => (
    <div className={`${isReply ? 'ml-12 mt-3' : ''}`}>
      <div className="flex space-x-3">
        <div className="w-10 h-10 rounded-full bg-shareup-profile flex items-center justify-center flex-shrink-0">
          {comment.user.profilePicture ? (
            <img 
              src={comment.user.profilePicture} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold text-sm">
              {comment.user.firstName[0]}{comment.user.lastName[0]}
            </span>
          )}
        </div>
        
        <div className="flex-1">
          <div className="bg-shareup-light rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-semibold text-shareup-dark text-sm">
                {comment.user.firstName} {comment.user.lastName}
              </h4>
              <span className="text-xs text-shareup-gray">
                {formatTime(comment.createdAt)}
              </span>
            </div>
            <p className="text-shareup-dark text-sm">{comment.content}</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-2 ml-3">
            <button
              onClick={() => handleLikeComment(comment.id, isReply, parentId)}
              className={`flex items-center space-x-1 text-xs ${
                comment.isLiked ? 'text-shareup-red' : 'text-shareup-gray'
              } hover:text-shareup-red transition-colors`}
            >
              <span>{comment.isLiked ? '❤️' : '🤍'}</span>
              <span>{comment.likesCount}</span>
            </button>
            
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs text-shareup-gray hover:text-shareup-primary transition-colors"
              >
                Reply
              </button>
            )}
          </div>

          {/* Reply Input */}
          {replyingTo === comment.id && (
            <div className="mt-3 ml-3">
              <div className="flex space-x-2">
                <ShareupInput
                  placeholder={`Reply to ${comment.user.firstName}...`}
                  value={replyText}
                  onChangeText={setReplyText}
                  multiline
                  className="flex-1"
                />
                <ShareupButton
                  title="Reply"
                  onPress={() => handleAddReply(comment.id)}
                  variant="primary"
                  size="small"
                  loading={isLoading}
                />
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map((reply) => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  isReply={true} 
                  parentId={comment.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!post) {
    return (
      <ShareupLayout currentPath="/comments">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shareup-primary"></div>
        </div>
      </ShareupLayout>
    );
  }

  return (
    <ShareupLayout currentPath="/comments">
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-shareup-light rounded-full transition-colors"
              >
                <span className="text-shareup-dark">←</span>
              </button>
              <h1 className="text-xl font-bold text-shareup-dark">Comments</h1>
            </div>
            <span className="text-shareup-gray text-sm">
              {comments.length} comment{comments.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Original Post */}
          <ShareupCard className="mb-6">
            <div className="flex space-x-3">
              <div className="w-12 h-12 rounded-full bg-shareup-profile flex items-center justify-center">
                {post.user.profilePicture ? (
                  <img 
                    src={post.user.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold">
                    {post.user.firstName[0]}{post.user.lastName[0]}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-shareup-dark">
                    {post.user.firstName} {post.user.lastName}
                  </h3>
                  <span className="text-sm text-shareup-gray">
                    {formatTime(post.createdAt)}
                  </span>
                </div>
                <p className="text-shareup-dark mb-3">{post.content}</p>
                <div className="flex items-center space-x-4 text-sm text-shareup-gray">
                  <span>{post.likesCount} likes</span>
                  <span>{post.commentsCount} comments</span>
                </div>
              </div>
            </div>
          </ShareupCard>

          {/* Add Comment */}
          <ShareupCard className="mb-6">
            <div className="flex space-x-3">
              <div className="w-10 h-10 rounded-full bg-shareup-profile flex items-center justify-center">
                <span className="text-white font-semibold text-sm">YN</span>
              </div>
              <div className="flex-1">
                <ShareupInput
                  placeholder="Write a comment..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  className="mb-3"
                />
                <div className="flex justify-end">
                  <ShareupButton
                    title="Post Comment"
                    onPress={handleAddComment}
                    variant="primary"
                    size="small"
                    loading={isLoading}
                    disabled={!newComment.trim()}
                  />
                </div>
              </div>
            </div>
          </ShareupCard>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <ShareupCard key={comment.id} padding="medium">
                  <CommentItem comment={comment} />
                </ShareupCard>
              ))
            ) : (
              <ShareupCard className="text-center py-12">
                <span className="text-6xl mb-4 block">💬</span>
                <h3 className="text-lg font-semibold text-shareup-dark mb-2">
                  No comments yet
                </h3>
                <p className="text-shareup-gray">
                  Be the first to comment on this post
                </p>
              </ShareupCard>
            )}
          </div>
        </div>
      </div>
    </ShareupLayout>
  );
}
