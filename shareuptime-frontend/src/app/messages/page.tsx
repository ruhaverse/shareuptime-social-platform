'use client';

import React, { useState, useEffect } from 'react';
import { ShareupLayout } from '@/components/layout/ShareupLayout';
import { ShareupButton } from '@/components/ui/ShareupButton';
import { ShareupCard } from '@/components/ui/ShareupCard';
import { shareupColors } from '@/styles/shareup-colors';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    isOnline: boolean;
  };
  lastMessage: Message;
  unreadCount: number;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Mock data
  const mockConversations: Conversation[] = [
    {
      id: '1',
      user: {
        id: '1',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        isOnline: true,
      },
      lastMessage: {
        id: '1',
        content: 'ShareUpTime gerçekten harika! 🎉',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        senderId: '1',
        isRead: false,
      },
      unreadCount: 2,
    },
    {
      id: '2',
      user: {
        id: '2',
        firstName: 'Zeynep',
        lastName: 'Kaya',
        isOnline: false,
      },
      lastMessage: {
        id: '2',
        content: 'Yarın buluşalım mı?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        senderId: '2',
        isRead: true,
      },
      unreadCount: 0,
    },
    {
      id: '3',
      user: {
        id: '3',
        firstName: 'Mehmet',
        lastName: 'Demir',
        isOnline: true,
      },
      lastMessage: {
        id: '3',
        content: 'Teşekkürler! 👍',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        senderId: 'current-user',
        isRead: true,
      },
      unreadCount: 0,
    },
  ];

  const mockMessages: Message[] = [
    {
      id: '1',
      content: 'Merhaba! ShareUpTime nasıl gidiyor?',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      senderId: '1',
      isRead: true,
    },
    {
      id: '2',
      content: 'Harika gidiyor! Yeni özellikler çok güzel.',
      timestamp: new Date(Date.now() - 480000).toISOString(),
      senderId: 'current-user',
      isRead: true,
    },
    {
      id: '3',
      content: 'ShareUpTime gerçekten harika! 🎉',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      senderId: '1',
      isRead: false,
    },
  ];

  useEffect(() => {
    setConversations(mockConversations);
  }, []);

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setMessages(mockMessages);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toISOString(),
      senderId: 'current-user',
      isRead: true,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString();
  };

  return (
    <ShareupLayout currentPath="/messages">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto flex h-screen">
          {/* Conversations List */}
          <div className="w-1/3 bg-white border-r border-shareup-lighter-gray">
            {/* Header */}
            <div className="p-4 border-b border-shareup-lighter-gray">
              <h1 className="text-xl font-bold text-shareup-dark">Messages</h1>
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full px-3 py-2 bg-shareup-light rounded-lg border-none outline-none focus:ring-2 focus:ring-shareup-primary"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="overflow-y-auto h-full">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation.id)}
                  className={`
                    w-full p-4 flex items-center space-x-3 hover:bg-shareup-light transition-colors duration-200
                    ${selectedConversation === conversation.id ? 'bg-shareup-light' : ''}
                  `}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-shareup-profile flex items-center justify-center">
                      {conversation.user.profilePicture ? (
                        <img 
                          src={conversation.user.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold">
                          {conversation.user.firstName[0]}{conversation.user.lastName[0]}
                        </span>
                      )}
                    </div>
                    {conversation.user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-shareup-active-green rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-shareup-dark">
                        {conversation.user.firstName} {conversation.user.lastName}
                      </p>
                      <span className="text-xs text-shareup-gray">
                        {formatTime(conversation.lastMessage.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-medium text-shareup-dark' : 'text-shareup-gray'}`}>
                        {conversation.lastMessage.content}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="ml-2 bg-shareup-primary text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-shareup-lighter-gray flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const conversation = conversations.find(c => c.id === selectedConversation);
                      return conversation ? (
                        <>
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-shareup-profile flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {conversation.user.firstName[0]}{conversation.user.lastName[0]}
                              </span>
                            </div>
                            {conversation.user.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-shareup-active-green rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-shareup-dark">
                              {conversation.user.firstName} {conversation.user.lastName}
                            </p>
                            <p className="text-xs text-shareup-gray">
                              {conversation.user.isOnline ? 'Online' : 'Offline'}
                            </p>
                          </div>
                        </>
                      ) : null;
                    })()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-shareup-light rounded-lg transition-colors">
                      <span className="text-xl">📞</span>
                    </button>
                    <button className="p-2 hover:bg-shareup-light rounded-lg transition-colors">
                      <span className="text-xl">🎥</span>
                    </button>
                    <button className="p-2 hover:bg-shareup-light rounded-lg transition-colors">
                      <span className="text-xl">ℹ️</span>
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-xs lg:max-w-md px-4 py-2 rounded-2xl
                          ${message.senderId === 'current-user'
                            ? 'bg-shareup-primary text-white'
                            : 'bg-white text-shareup-dark border border-shareup-lighter-gray'
                          }
                        `}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${message.senderId === 'current-user' ? 'text-white/70' : 'text-shareup-gray'}`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t border-shareup-lighter-gray">
                  <div className="flex items-center space-x-3">
                    <button className="p-2 hover:bg-shareup-light rounded-lg transition-colors">
                      <span className="text-xl">📎</span>
                    </button>
                    <button className="p-2 hover:bg-shareup-light rounded-lg transition-colors">
                      <span className="text-xl">📷</span>
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-shareup-light rounded-full border-none outline-none focus:ring-2 focus:ring-shareup-primary"
                    />
                    <button className="p-2 hover:bg-shareup-light rounded-lg transition-colors">
                      <span className="text-xl">😊</span>
                    </button>
                    <ShareupButton
                      title="Send"
                      onPress={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="small"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">💬</span>
                  <h2 className="text-xl font-semibold text-shareup-dark mb-2">
                    Select a conversation
                  </h2>
                  <p className="text-shareup-gray">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ShareupLayout>
  );
}
