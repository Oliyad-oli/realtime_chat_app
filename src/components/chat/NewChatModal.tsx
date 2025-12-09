import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { getUsers, findDirectChat, createChat } from '@/lib/storage';
import { User } from '@/types/chat';
import { Search, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, onChatCreated }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const users = useMemo(() => {
    return getUsers().filter(u => u.id !== user?.id);
  }, [user]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleSelectUser = (selectedUser: User) => {
    if (!user) return;

    // Check if chat already exists
    const existingChat = findDirectChat(user.id, selectedUser.id);
    if (existingChat) {
      onChatCreated(existingChat.id);
      onClose();
      return;
    }

    // Create new chat
    const newChat = createChat({
      type: 'direct',
      participants: [user.id, selectedUser.id],
    });

    onChatCreated(newChat.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            New Conversation
          </DialogTitle>
          <DialogDescription>
            Select a user to start a conversation
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="h-64">
          <div className="space-y-1">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No users found</p>
              </div>
            ) : (
              filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className="w-full p-3 rounded-lg flex items-center gap-3 transition-all duration-200 hover:bg-accent"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-medium">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={cn(
                      "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
                      u.status === 'online' && "bg-online",
                      u.status === 'away' && "bg-yellow-500",
                      u.status === 'offline' && "bg-offline"
                    )} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatModal;
