'use client';

import React, { useState, useEffect } from 'react';
import { ShareupLayout } from '@/components/layout/ShareupLayout';
import { ShareupButton } from '@/components/ui/ShareupButton';
import { ShareupCard } from '@/components/ui/ShareupCard';
import { ShareupInput } from '@/components/ui/ShareupInput';
import { shareupColors } from '@/styles/shareup-colors';
import { useRouter } from 'next/navigation';

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  coverImage?: string;
  isJoined: boolean;
  isAdmin: boolean;
  lastActivity: string;
}

export default function GroupsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'discover' | 'my-groups' | 'created'>('my-groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [createdGroups, setCreatedGroups] = useState<Group[]>([]);

  // Mock data
  const mockDiscoverGroups: Group[] = [
    {
      id: '1',
      name: 'Tech Enthusiasts',
      description: 'Teknoloji tutkunları için topluluk',
      memberCount: 1250,
      isPrivate: false,
      isJoined: false,
      isAdmin: false,
      lastActivity: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      name: 'Photography Club',
      description: 'Fotoğraf severlerin buluşma noktası',
      memberCount: 890,
      isPrivate: false,
      isJoined: false,
      isAdmin: false,
      lastActivity: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '3',
      name: 'Startup Community',
      description: 'Girişimciler ve startup dünyası',
      memberCount: 567,
      isPrivate: true,
      isJoined: false,
      isAdmin: false,
      lastActivity: new Date(Date.now() - 10800000).toISOString(),
    },
  ];

  const mockMyGroups: Group[] = [
    {
      id: '4',
      name: 'ShareUpTime Users',
      description: 'ShareUpTime kullanıcıları topluluğu',
      memberCount: 2340,
      isPrivate: false,
      isJoined: true,
      isAdmin: false,
      lastActivity: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: '5',
      name: 'Web Developers',
      description: 'Web geliştirme ve programlama',
      memberCount: 1567,
      isPrivate: false,
      isJoined: true,
      isAdmin: false,
      lastActivity: new Date(Date.now() - 5400000).toISOString(),
    },
  ];

  const mockCreatedGroups: Group[] = [
    {
      id: '6',
      name: 'My Local Community',
      description: 'Yerel topluluk grubu',
      memberCount: 45,
      isPrivate: true,
      isJoined: true,
      isAdmin: true,
      lastActivity: new Date(Date.now() - 900000).toISOString(),
    },
  ];

  useEffect(() => {
    setGroups(mockDiscoverGroups);
    setMyGroups(mockMyGroups);
    setCreatedGroups(mockCreatedGroups);
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const formatMemberCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleJoinGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isJoined: true, memberCount: group.memberCount + 1 }
        : group
    ));
  };

  const handleLeaveGroup = (groupId: string) => {
    setMyGroups(prev => prev.filter(group => group.id !== groupId));
  };

  const filteredGroups = () => {
    let currentGroups: Group[] = [];
    
    switch (activeTab) {
      case 'discover':
        currentGroups = groups;
        break;
      case 'my-groups':
        currentGroups = myGroups;
        break;
      case 'created':
        currentGroups = createdGroups;
        break;
    }

    if (!searchQuery) return currentGroups;
    
    return currentGroups.filter(group =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const GroupCard = ({ group }: { group: Group }) => (
    <ShareupCard padding="none" className="hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-shareup-gradient-start to-shareup-gradient-end">
          {group.coverImage && (
            <img 
              src={group.coverImage} 
              alt="Group cover" 
              className="w-full h-full object-cover"
            />
          )}
          {group.isPrivate && (
            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
              🔒 Private
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-shareup-dark text-lg mb-1">{group.name}</h3>
              <p className="text-shareup-gray text-sm mb-2 line-clamp-2">{group.description}</p>
              <div className="flex items-center space-x-4 text-xs text-shareup-gray">
                <span>👥 {formatMemberCount(group.memberCount)} members</span>
                <span>🕐 Active {formatTime(group.lastActivity)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            {activeTab === 'discover' && !group.isJoined && (
              <ShareupButton
                title={group.isPrivate ? "Request to Join" : "Join Group"}
                onPress={() => handleJoinGroup(group.id)}
                variant="primary"
                size="small"
                fullWidth
              />
            )}
            
            {activeTab === 'my-groups' && (
              <>
                <ShareupButton
                  title="View Group"
                  onPress={() => router.push(`/groups/${group.id}`)}
                  variant="primary"
                  size="small"
                  fullWidth
                />
                <ShareupButton
                  title="Leave"
                  onPress={() => handleLeaveGroup(group.id)}
                  variant="secondary"
                  size="small"
                />
              </>
            )}
            
            {activeTab === 'created' && (
              <>
                <ShareupButton
                  title="Manage"
                  onPress={() => router.push(`/groups/${group.id}/manage`)}
                  variant="primary"
                  size="small"
                  fullWidth
                />
                <ShareupButton
                  title="View"
                  onPress={() => router.push(`/groups/${group.id}`)}
                  variant="secondary"
                  size="small"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </ShareupCard>
  );

  return (
    <ShareupLayout currentPath="/groups">
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-shareup-dark">Groups</h1>
              <p className="text-shareup-gray">Connect with communities that share your interests</p>
            </div>
            <ShareupButton
              title="Create Group"
              onPress={() => router.push('/groups/create')}
              variant="primary"
              size="medium"
            />
          </div>

          {/* Search */}
          <div className="mb-6">
            <ShareupInput
              placeholder="Search groups..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              icon="🔍"
            />
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-white rounded-lg p-1 border border-shareup-lighter-gray mb-6 overflow-x-auto">
            {[
              { key: 'my-groups', label: 'My Groups', count: myGroups.length },
              { key: 'discover', label: 'Discover', count: groups.length },
              { key: 'created', label: 'Created by Me', count: createdGroups.length },
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups().length > 0 ? (
              filteredGroups().map((group) => (
                <GroupCard key={group.id} group={group} />
              ))
            ) : (
              <div className="col-span-full">
                <ShareupCard className="text-center py-12">
                  <span className="text-6xl mb-4 block">
                    {activeTab === 'discover' ? '🔍' : activeTab === 'my-groups' ? '👥' : '⭐'}
                  </span>
                  <h3 className="text-lg font-semibold text-shareup-dark mb-2">
                    {activeTab === 'discover' && 'No groups found'}
                    {activeTab === 'my-groups' && 'No groups joined yet'}
                    {activeTab === 'created' && 'No groups created yet'}
                  </h3>
                  <p className="text-shareup-gray mb-4">
                    {activeTab === 'discover' && 'Try adjusting your search terms'}
                    {activeTab === 'my-groups' && 'Join groups to connect with communities'}
                    {activeTab === 'created' && 'Create your first group to build a community'}
                  </p>
                  {activeTab !== 'discover' && (
                    <ShareupButton
                      title={activeTab === 'my-groups' ? 'Discover Groups' : 'Create Group'}
                      onPress={() => activeTab === 'my-groups' ? setActiveTab('discover') : router.push('/groups/create')}
                      variant="primary"
                      size="medium"
                    />
                  )}
                </ShareupCard>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {activeTab === 'my-groups' && myGroups.length > 0 && (
            <ShareupCard className="mt-6">
              <h3 className="text-lg font-semibold text-shareup-dark mb-4">Your Group Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-shareup-light rounded-lg">
                  <p className="text-2xl font-bold text-shareup-primary">{myGroups.length}</p>
                  <p className="text-sm text-shareup-gray">Groups Joined</p>
                </div>
                <div className="text-center p-4 bg-shareup-light rounded-lg">
                  <p className="text-2xl font-bold text-shareup-primary">{createdGroups.length}</p>
                  <p className="text-sm text-shareup-gray">Groups Created</p>
                </div>
                <div className="text-center p-4 bg-shareup-light rounded-lg">
                  <p className="text-2xl font-bold text-shareup-primary">
                    {myGroups.reduce((sum, group) => sum + group.memberCount, 0)}
                  </p>
                  <p className="text-sm text-shareup-gray">Total Members</p>
                </div>
              </div>
            </ShareupCard>
          )}
        </div>
      </div>
    </ShareupLayout>
  );
}
