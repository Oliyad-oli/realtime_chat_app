import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types/chat';
import { getCurrentUser, setCurrentUser, getUserByEmail, createUser, updateUser } from '@/lib/storage';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateCurrentUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setAuthState({ user, isAuthenticated: true });
      updateUser(user.id, { status: 'online' });
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const user = getUserByEmail(email);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    if (user.password !== password) {
      return { success: false, error: 'Invalid password' };
    }

    const updatedUser = updateUser(user.id, { status: 'online' });
    if (updatedUser) {
      setCurrentUser(updatedUser);
      setAuthState({ user: updatedUser, isAuthenticated: true });
    }
    
    return { success: true };
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const existingUser = getUserByEmail(email);
    
    if (existingUser) {
      return { success: false, error: 'Email already registered' };
    }

    const newUser = createUser({ name, email, password });
    setCurrentUser(newUser);
    setAuthState({ user: newUser, isAuthenticated: true });
    
    return { success: true };
  };

  const logout = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!authState.user) {
      return { success: false, error: 'No user logged in' };
    }

    if (authState.user.email !== email || authState.user.password !== password) {
      return { success: false, error: 'Invalid credentials' };
    }

    updateUser(authState.user.id, { status: 'offline' });
    setCurrentUser(null);
    setAuthState({ user: null, isAuthenticated: false });
    
    return { success: true };
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    if (authState.user) {
      const updatedUser = updateUser(authState.user.id, updates);
      if (updatedUser) {
        setCurrentUser(updatedUser);
        setAuthState({ ...authState, user: updatedUser });
      }
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
