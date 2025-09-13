'use client';

import React, { useState, useEffect, useRef } from 'react';
import { shareupColors } from '@/styles/shareup-colors';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface ShareupChatComponentProps {
  currentUserId: string;
  chatId: string;
  participants: ChatUser[];
  onSendMessage: (message: string, type: 'text' | 'image' | 'file', file?: File) => void;
  onTyping?: (isTyping: boolean) => void;
  messages: Message[];
  isLoading?: boolean;
}

export const ShareupChatComponent: React.FC<ShareupChatComponentProps> = ({
  currentUserId,
  chatId,
  participants,
  onSendMessage,
  onTyping,
  messages,
  isLoading = false
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim(), 'text');
      setNewMessage('');
      setIsTyping(false);
      onTyping?.(false);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      onTyping?.(true);
    } else if (isTyping && value.length === 0) {
      setIsTyping(false);
      onTyping?.(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type.startsWith('image/') ? 'image' : 'file';
      onSendMessage(file.name, fileType, file);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date);
    }
  };

  const otherParticipants = participants.filter(p => p.id !== currentUserId);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {otherParticipants.length === 1 ? (
            <>
              <div className="relative">
                <img
                  src={otherParticipants[0].avatar}
                  alt={otherParticipants[0].name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {otherParticipants[0].isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-shareup-dark">{otherParticipants[0].name}</h3>
                <p className="text-xs text-gray-500">
                  {otherParticipants[0].isOnline ? 'Online' : 
                   otherParticipants[0].lastSeen ? `Last seen ${formatTime(otherParticipants[0].lastSeen)}` : 'Offline'}
                </p>
              </div>
            </>
          ) : (
            <div>
              <h3 className="font-semibold text-shareup-dark">
                Group Chat ({participants.length} members)
              </h3>
              <p className="text-xs text-gray-500">
                {participants.filter(p => p.isOnline).length} online
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-shareup-primary rounded-full hover:bg-gray-100">
            📞
          </button>
          <button className="p-2 text-gray-400 hover:text-shareup-primary rounded-full hover:bg-gray-100">
            📹
          </button>
          <button className="p-2 text-gray-400 hover:text-shareup-primary rounded-full hover:bg-gray-100">
            ⚙️
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-shareup-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isCurrentUser = message.senderId === currentUserId;
            const showDate = index === 0 || 
              formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="text-center text-xs text-gray-500 my-4">
                    {formatDate(message.timestamp)}
                  </div>
                )}
                
                <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!isCurrentUser && (
                      <img
                        src={message.senderAvatar}
                        alt={message.senderName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    
                    <div className={`px-4 py-2 rounded-2xl ${
                      isCurrentUser 
                        ? 'bg-shareup-primary text-white' 
                        : 'bg-gray-100 text-shareup-dark'
                    }`}>
                      {!isCurrentUser && participants.length > 2 && (
                        <p className="text-xs font-medium mb-1 opacity-70">
                          {message.senderName}
                        </p>
                      )}
                      
                      {message.type === 'text' && (
                        <p className="text-sm">{message.content}</p>
                      )}
                      
                      {message.type === 'image' && (
                        <div>
                          <img
                            src={message.fileUrl}
                            alt="Shared image"
                            className="max-w-full h-auto rounded-lg mb-1"
                          />
                          {message.content && (
                            <p className="text-sm">{message.content}</p>
                          )}
                        </div>
                      )}
                      
                      {message.type === 'file' && (
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-white/20 rounded">
                            📎
                          </div>
                          <div>
                            <p className="text-sm font-medium">{message.fileName}</p>
                            <p className="text-xs opacity-70">File</p>
                          </div>
                        </div>
                      )}
                      
                      <p className={`text-xs mt-1 opacity-70 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm">
              {typingUsers.length === 1 
                ? `${typingUsers[0]} is typing...`
                : `${typingUsers.length} people are typing...`
              }
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-shareup-primary rounded-full hover:bg-gray-100"
          >
            📎
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-shareup-primary focus:border-transparent"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`p-2 rounded-full transition-colors ${
              newMessage.trim()
                ? 'bg-shareup-primary text-white hover:bg-shareup-primary/90'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            ➤
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
        </form>
      </div>
    </div>
  );
};
