'use client';

import React, { useState } from 'react';
import { AdvancedMessagingComponent } from '@/components/ui/AdvancedMessagingComponent';
import { AdvancedSidebarLayout } from '@/components/ui/AdvancedSidebarLayout';

export default function MessagesPage() {
  const [selectedContact, setSelectedContact] = useState<any>(null);

  // Mock current user
  const currentUser = {
    id: 'current-user',
    firstName: 'Mevcut',
    lastName: 'Kullanıcı',
    profilePicture: '/api/placeholder/64/64',
    isOnline: true
  };

  // Mock contacts
  const contacts = [
    {
      id: '1',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      profilePicture: '/api/placeholder/64/64',
      isOnline: true,
      lastSeen: new Date().toISOString()
    },
    {
      id: '2',
      firstName: 'Zeynep',
      lastName: 'Kaya',
      profilePicture: '/api/placeholder/64/64',
      isOnline: false,
      lastSeen: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '3',
      firstName: 'Mehmet',
      lastName: 'Demir',
      profilePicture: '/api/placeholder/64/64',
      isOnline: true,
      lastSeen: new Date().toISOString()
    }
  ];

  // Mock messages
  const messages = [
    {
      id: '1',
      content: 'Merhaba! ShareUpTime nasıl gidiyor?',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      senderId: '1',
      isRead: true,
      type: 'text' as const
    },
    {
      id: '2',
      content: 'Harika gidiyor! Yeni özellikler çok güzel.',
      timestamp: new Date(Date.now() - 480000).toISOString(),
      senderId: 'current-user',
      isRead: true,
      type: 'text' as const
    },
    {
      id: '3',
      content: 'ShareUpTime gerçekten harika! 🎉',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      senderId: '1',
      isRead: false,
      type: 'text' as const
    }
  ];

  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact);
  };

  const handleSendMessage = (content: string) => {
    console.log('Sending message:', content, 'to:', selectedContact?.id);
    // Here you would implement the actual message sending logic
  };

  const handleSearchContacts = (query: string) => {
    console.log('Searching contacts:', query);
    // Here you would implement the actual contact search logic
  };

  return (
    <AdvancedSidebarLayout user={currentUser}>
      <div className="flex-1 min-h-screen">
        <AdvancedMessagingComponent
          currentUser={currentUser}
          contacts={contacts}
          messages={messages}
          selectedContact={selectedContact}
          onContactSelect={handleContactSelect}
          onSendMessage={handleSendMessage}
          onSearchContacts={handleSearchContacts}
        />
      </div>
    </AdvancedSidebarLayout>
  );
}
