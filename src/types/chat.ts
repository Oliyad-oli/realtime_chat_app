export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  isAdmin?: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  chatId: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image';
  imageUrl?: string;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  name?: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  createdBy?: string;
}

export interface TypingIndicator {
  chatId: string;
  userId: string;
  isTyping: boolean;
}

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};
