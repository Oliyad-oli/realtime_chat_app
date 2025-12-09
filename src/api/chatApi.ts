import { User, Chat, Message } from '@/types/chat';
import api from './axiosInstance';   // axios pre-configured instance

// ---------------------- USERS ----------------------

export const getUsers = async (): Promise<User[]> => {
  const res = await api.get('/users');
  return res.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export const getUserByEmail = async (email: string): Promise<User> => {
  const res = await api.get(`/users/email/${email}`);
  return res.data;
};

export const createUser = async (
  user: Omit<User, 'id' | 'createdAt' | 'status'>
): Promise<User> => {
  const res = await api.post('/users', user);
  return res.data;
};

export const updateUser = async (
  id: string,
  updates: Partial<User>
): Promise<User> => {
  const res = await api.put(`/users/${id}`, updates);
  return res.data;
};

// ---------------------- AUTH SESSION ----------------------

export const getCurrentUser = (): User | null => {
  const user = sessionStorage.getItem('current_user');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    sessionStorage.setItem('current_user', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('current_user');
  }
};

// ---------------------- CHATS ----------------------

export const getChats = async (): Promise<Chat[]> => {
  const res = await api.get('/chats');
  return res.data;
};

export const getChatById = async (id: string): Promise<Chat> => {
  const res = await api.get(`/chats/${id}`);
  return res.data;
};

export const getUserChats = async (userId: string): Promise<Chat[]> => {
  const res = await api.get(`/chats/user/${userId}`);
  return res.data;
};

export const createChat = async (
  chat: Omit<Chat, 'id' | 'createdAt' | 'unreadCount'>
): Promise<Chat> => {
  const res = await api.post('/chats', chat);
  return res.data;
};

export const updateChat = async (
  id: string,
  updates: Partial<Chat>
): Promise<Chat> => {
  const res = await api.put(`/chats/${id}`, updates);
  return res.data;
};

export const findDirectChat = async (
  userId1: string,
  userId2: string
): Promise<Chat | null> => {
  const res = await api.get(`/chats/direct/${userId1}/${userId2}`);
  return res.data;
};

// ---------------------- MESSAGES ----------------------

export const getChatMessages = async (chatId: string): Promise<Message[]> => {
  const res = await api.get(`/messages/chat/${chatId}`);
  return res.data;
};

export const createMessage = async (
  message: Omit<Message, 'id' | 'timestamp' | 'status'>
): Promise<Message> => {
  const res = await api.post('/messages', message);
  return res.data;
};

export const updateMessageStatus = async (
  messageId: string,
  status: Message['status']
) => {
  await api.put(`/messages/${messageId}/status`, { status });
};
