'use client';

import React, { useState, useEffect, useRef } from 'react';
import { shareupColors } from '@/styles/shareup-colors';
import { Search, Send, Phone, Video, MoreVertical, Smile, Paperclip, Mic } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
}

interface AdvancedMessagingComponentProps {
  currentUser: User;
  contacts: User[];
  messages: Message[];
  selectedContact?: User;
  onContactSelect: (contact: User) => void;
  onSendMessage: (content: string, type: 'text' | 'image' | 'file') => void;
  onSearchContacts: (query: string) => void;
}

export const AdvancedMessagingComponent: React.FC<AdvancedMessagingComponentProps> = ({
  currentUser,
  contacts,
  messages,
  selectedContact,
  onContactSelect,
  onSendMessage,
  onSearchContacts
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput.trim(), 'text');
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLastMessage = (contactId: string) => {
    const contactMessages = messages.filter(
      msg => msg.senderId === contactId || (selectedContact?.id === contactId)
    );
    return contactMessages[contactMessages.length - 1];
  };

  return (
    <div className="flex h-[600px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Contacts Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={currentUser.profilePicture || '/api/placeholder/40/40'}
              alt={`${currentUser.firstName} ${currentUser.lastName}`}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">
                {currentUser.firstName} {currentUser.lastName}
              </h3>
              <p className="text-sm text-gray-500">Messages</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearchContacts(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact) => {
            const lastMessage = getLastMessage(contact.id);
            const isSelected = selectedContact?.id === contact.id;

            return (
              <button
                key={contact.id}
                onClick={() => onContactSelect(contact)}
                className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={contact.profilePicture || '/api/placeholder/48/48'}
                    alt={`${contact.firstName} ${contact.lastName}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {contact.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                <div className="flex-1 text-left">
                  <h4 className="font-medium text-gray-900 truncate">
                    {contact.firstName} {contact.lastName}
                  </h4>
                  {lastMessage ? (
                    <p className="text-sm text-gray-500 truncate">
                      {lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">
                      {contact.isOnline ? 'Online' : `Active ${contact.lastSeen || '2 mins ago'}`}
                    </p>
                  )}
                </div>

                {lastMessage && (
                  <div className="text-xs text-gray-400">
                    {formatTime(lastMessage.timestamp)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={selectedContact.profilePicture || '/api/placeholder/40/40'}
                    alt={`${selectedContact.firstName} ${selectedContact.lastName}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {selectedContact.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedContact.firstName} {selectedContact.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedContact.isOnline ? 'Online' : `Active ${selectedContact.lastSeen || '2 mins ago'}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages
                .filter(msg => 
                  msg.senderId === selectedContact.id || msg.senderId === currentUser.id
                )
                .map((message) => {
                  const isOwnMessage = message.senderId === currentUser.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <Smile className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Mic className="w-5 h-5 text-gray-600" />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className={`p-2 rounded-full transition-colors ${
                    messageInput.trim()
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Contact Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a contact to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
