'use client';

import React, { useState, useEffect } from 'react';
import { ShareupLayout } from '@/components/layout/ShareupLayout';
import { ShareupButton } from '@/components/ui/ShareupButton';
import { ShareupCard } from '@/components/ui/ShareupCard';
import { ShareupInput } from '@/components/ui/ShareupInput';
import { shareupColors } from '@/styles/shareup-colors';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
}

interface FriendRequest {
  id: string;
  user: User;
  type: 'sent' | 'received';
  timestamp: string;
}

export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState<'discover' | 'requests' | 'friends' | 'sent'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);

  // Mock data
  const mockUsers: User[] = [
    { id: '1', firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet@example.com' },
    { id: '2', firstName: 'Zeynep', lastName: 'Kaya', email: 'zeynep@example.com' },
    { id: '3', firstName: 'Mehmet', lastName: 'Demir', email: 'mehmet@example.com' },
    { id: '4', firstName: 'Ayşe', lastName: 'Özkan', email: 'ayse@example.com' },
    { id: '5', firstName: 'Can', lastName: 'Yıldız', email: 'can@example.com' },
  ];

  const mockFriendRequests: FriendRequest[] = [
    {
      id: '1',
      user: { id: '6', firstName: 'Elif', lastName: 'Şahin', email: 'elif@example.com' },
      type: 'received',
      timestamp: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: '2',
      user: { id: '7', firstName: 'Burak', lastName: 'Çelik', email: 'burak@example.com' },
      type: 'received',
      timestamp: new Date(Date.now() - 600000).toISOString(),
    },
  ];

  const mockFriends: User[] = [
    { id: '8', firstName: 'Selin', lastName: 'Aydın', email: 'selin@example.com' },
    { id: '9', firstName: 'Emre', lastName: 'Koç', email: 'emre@example.com' },
    { id: '10', firstName: 'Deniz', lastName: 'Arslan', email: 'deniz@example.com' },
  ];

  const mockSentRequests: FriendRequest[] = [
    {
      id: '3',
      user: { id: '11', firstName: 'Kemal', lastName: 'Öz', email: 'kemal@example.com' },
      type: 'sent',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
  ];

  useEffect(() => {
    setUsers(mockUsers);
    setFriendRequests(mockFriendRequests);
    setFriends(mockFriends);
    setSentRequests(mockSentRequests);
  }, []);

  const handleSendRequest = (user: User) => {
    const newRequest: FriendRequest = {
      id: Date.now().toString(),
      user,
      type: 'sent',
      timestamp: new Date().toISOString(),
    };
    setSentRequests(prev => [...prev, newRequest]);
    setUsers(prev => prev.filter(u => u.id !== user.id));
  };

  const handleCancelRequest = (requestId: string) => {
    const request = sentRequests.find(r => r.id === requestId);
    if (request) {
      setSentRequests(prev => prev.filter(r => r.id !== requestId));
      setUsers(prev => [...prev, request.user]);
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (request) {
      setFriends(prev => [...prev, request.user]);
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    }
  };

  const handleDeclineRequest = (requestId: string) => {
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleRemoveFriend = (userId: string) => {
    const friend = friends.find(f => f.id === userId);
    if (friend && confirm(`Remove ${friend.firstName} ${friend.lastName} from friends?`)) {
      setFriends(prev => prev.filter(f => f.id !== userId));
      setUsers(prev => [...prev, friend]);
    }
  };

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const UserCard = ({ user, actionType, requestId }: { user: User; actionType: 'send' | 'cancel' | 'accept' | 'remove'; requestId?: string }) => (
    <ShareupCard padding="none" className="hover:shadow-lg transition-shadow duration-200">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-shareup-profile flex items-center justify-center">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white font-semibold">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-shareup-dark">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-shareup-gray">{user.email}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {actionType === 'send' && (
            <ShareupButton
              title="Send Request"
              onPress={() => handleSendRequest(user)}
              variant="primary"
              size="small"
            />
          )}
          {actionType === 'cancel' && requestId && (
            <ShareupButton
              title="Cancel"
              onPress={() => handleCancelRequest(requestId)}
              variant="secondary"
              size="small"
            />
          )}
          {actionType === 'accept' && requestId && (
            <>
              <ShareupButton
                title="Accept"
                onPress={() => handleAcceptRequest(requestId)}
                variant="primary"
                size="small"
              />
              <ShareupButton
                title="Decline"
                onPress={() => handleDeclineRequest(requestId)}
                variant="secondary"
                size="small"
              />
            </>
          )}
          {actionType === 'remove' && (
            <ShareupButton
              title="Remove"
              onPress={() => handleRemoveFriend(user.id)}
              variant="secondary"
              size="small"
            />
          )}
        </div>
      </div>
    </ShareupCard>
  );

  return (
    <ShareupLayout currentPath="/activity">
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-shareup-dark mb-4">Activity</h1>
            
            {/* Search Bar */}
            <ShareupInput
              placeholder="Search friends..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              icon="🔍"
            />
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-white rounded-lg p-1 border border-shareup-lighter-gray mb-6 overflow-x-auto">
            {[
              { key: 'discover', label: 'Discover', count: filteredUsers.length },
              { key: 'requests', label: 'Requests', count: friendRequests.length },
              { key: 'friends', label: 'All Friends', count: friends.length },
              { key: 'sent', label: 'Sent Requests', count: sentRequests.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`
                  flex items-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.key
                    ? 'bg-shareup-primary text-white shadow-sm'
                    : 'text-shareup-gray hover:bg-shareup-light'
                  }
                `}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-shareup-light'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Discover Tab */}
            {activeTab === 'discover' && (
              <>
                {filteredUsers.length > 0 ? (
                  <>
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-shareup-dark mb-2">
                        Suggested Friends
                      </h2>
                      <p className="text-shareup-gray">
                        People you may know based on mutual connections
                      </p>
                    </div>
                    {filteredUsers.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        actionType="send"
                      />
                    ))}
                  </>
                ) : (
                  <ShareupCard className="text-center py-12">
                    <span className="text-6xl mb-4 block">👥</span>
                    <h3 className="text-lg font-semibold text-shareup-dark mb-2">
                      No users found
                    </h3>
                    <p className="text-shareup-gray">
                      Try adjusting your search terms
                    </p>
                  </ShareupCard>
                )}
              </>
            )}

            {/* Friend Requests Tab */}
            {activeTab === 'requests' && (
              <>
                {friendRequests.length > 0 ? (
                  <>
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-shareup-dark mb-2">
                        Friend Requests
                      </h2>
                      <p className="text-shareup-gray">
                        People who want to connect with you
                      </p>
                    </div>
                    {friendRequests.map((request) => (
                      <div key={request.id}>
                        <UserCard
                          user={request.user}
                          actionType="accept"
                          requestId={request.id}
                        />
                        <p className="text-xs text-shareup-gray mt-1 ml-4">
                          {formatTime(request.timestamp)}
                        </p>
                      </div>
                    ))}
                  </>
                ) : (
                  <ShareupCard className="text-center py-12">
                    <span className="text-6xl mb-4 block">📬</span>
                    <h3 className="text-lg font-semibold text-shareup-dark mb-2">
                      No friend requests
                    </h3>
                    <p className="text-shareup-gray">
                      When people send you friend requests, they'll appear here
                    </p>
                  </ShareupCard>
                )}
              </>
            )}

            {/* All Friends Tab */}
            {activeTab === 'friends' && (
              <>
                {friends.length > 0 ? (
                  <>
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-shareup-dark mb-2">
                        Your Friends ({friends.length})
                      </h2>
                      <p className="text-shareup-gray">
                        People you're connected with
                      </p>
                    </div>
                    {friends.map((friend) => (
                      <UserCard
                        key={friend.id}
                        user={friend}
                        actionType="remove"
                      />
                    ))}
                  </>
                ) : (
                  <ShareupCard className="text-center py-12">
                    <span className="text-6xl mb-4 block">👫</span>
                    <h3 className="text-lg font-semibold text-shareup-dark mb-2">
                      No friends yet
                    </h3>
                    <p className="text-shareup-gray">
                      Start connecting with people to build your network
                    </p>
                  </ShareupCard>
                )}
              </>
            )}

            {/* Sent Requests Tab */}
            {activeTab === 'sent' && (
              <>
                {sentRequests.length > 0 ? (
                  <>
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-shareup-dark mb-2">
                        Sent Requests
                      </h2>
                      <p className="text-shareup-gray">
                        Friend requests you've sent
                      </p>
                    </div>
                    {sentRequests.map((request) => (
                      <div key={request.id}>
                        <UserCard
                          user={request.user}
                          actionType="cancel"
                          requestId={request.id}
                        />
                        <p className="text-xs text-shareup-gray mt-1 ml-4">
                          Sent {formatTime(request.timestamp)}
                        </p>
                      </div>
                    ))}
                  </>
                ) : (
                  <ShareupCard className="text-center py-12">
                    <span className="text-6xl mb-4 block">📤</span>
                    <h3 className="text-lg font-semibold text-shareup-dark mb-2">
                      No sent requests
                    </h3>
                    <p className="text-shareup-gray">
                      Friend requests you send will appear here
                    </p>
                  </ShareupCard>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ShareupLayout>
  );
}
