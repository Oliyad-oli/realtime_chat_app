import { User, Chat, Message } from '@/types/chat';

const USERS_KEY = 'chat_users';
const CHATS_KEY = 'chat_chats';
const MESSAGES_KEY = 'chat_messages';
const CURRENT_USER_KEY = 'chat_current_user';

// Initialize with some demo data
const initializeDemoData = () => {
  const existingUsers = localStorage.getItem(USERS_KEY);
  if (!existingUsers) {
    const demoUsers: User[] = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@chat.com',
        password: 'admin123',
        status: 'online',
        isAdmin: true,
        createdAt: new Date(),
      },
      {
        id: '2',
        name: 'Sarah Wilson',
        email: 'sarah@chat.com',
        password: 'password',
        status: 'online',
        createdAt: new Date(),
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@chat.com',
        password: 'password',
        status: 'away',
        createdAt: new Date(),
      },
      {
        id: '4',
        name: 'Emily Davis',
        email: 'emily@chat.com',
        password: 'password',
        status: 'offline',
        createdAt: new Date(),
      },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(demoUsers));
  }
};

initializeDemoData();

// User operations
export const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

export const getUserById = (id: string): User | undefined => {
  return getUsers().find(u => u.id === id);
};

export const getUserByEmail = (email: string): User | undefined => {
  return getUsers().find(u => u.email === email);
};

export const createUser = (user: Omit<User, 'id' | 'createdAt' | 'status'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: Date.now().toString(),
    status: 'online',
    createdAt: new Date(),
  };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return newUser;
};

export const updateUser = (id: string, updates: Partial<User>): User | undefined => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users[index];
  }
  return undefined;
};

// Current user session
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// Chat operations
export const getChats = (): Chat[] => {
  const chats = localStorage.getItem(CHATS_KEY);
  return chats ? JSON.parse(chats) : [];
};

export const getChatById = (id: string): Chat | undefined => {
  return getChats().find(c => c.id === id);
};

export const getUserChats = (userId: string): Chat[] => {
  return getChats().filter(c => c.participants.includes(userId));
};

export const createChat = (chat: Omit<Chat, 'id' | 'createdAt' | 'unreadCount'>): Chat => {
  const chats = getChats();
  const newChat: Chat = {
    ...chat,
    id: Date.now().toString(),
    unreadCount: 0,
    createdAt: new Date(),
  };
  chats.push(newChat);
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  return newChat;
};

export const updateChat = (id: string, updates: Partial<Chat>): Chat | undefined => {
  const chats = getChats();
  const index = chats.findIndex(c => c.id === id);
  if (index !== -1) {
    chats[index] = { ...chats[index], ...updates };
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
    return chats[index];
  }
  return undefined;
};

export const findDirectChat = (userId1: string, userId2: string): Chat | undefined => {
  return getChats().find(
    c => c.type === 'direct' && 
    c.participants.includes(userId1) && 
    c.participants.includes(userId2)
  );
};

// Message operations
export const getMessages = (): Message[] => {
  const messages = localStorage.getItem(MESSAGES_KEY);
  return messages ? JSON.parse(messages) : [];
};

export const getChatMessages = (chatId: string): Message[] => {
  return getMessages().filter(m => m.chatId === chatId);
};

export const createMessage = (message: Omit<Message, 'id' | 'timestamp' | 'status'>): Message => {
  const messages = getMessages();
  const newMessage: Message = {
    ...message,
    id: Date.now().toString(),
    timestamp: new Date(),
    status: 'sent',
  };
  messages.push(newMessage);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  
  // Update chat's last message
  updateChat(message.chatId, { lastMessage: newMessage });
  
  return newMessage;
};

export const updateMessageStatus = (messageId: string, status: Message['status']) => {
  const messages = getMessages();
  const index = messages.findIndex(m => m.id === messageId);
  if (index !== -1) {
    messages[index].status = status;
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }
};
