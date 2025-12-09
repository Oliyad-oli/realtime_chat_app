import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserChats, getUsers, getUserById } from '@/lib/storage';
import { Chat, User } from '@/types/chat';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Users, MessageCircle, Settings, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ChatSidebarProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onNewGroup: () => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  selectedChatId,
  onSelectChat,
  onNewChat,
  onNewGroup,
  onOpenSettings,
  onOpenAdmin,
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const chats = useMemo(() => {
    if (!user) return [];
    return getUserChats(user.id);
  }, [user]);

  const filteredChats = useMemo(() => {
    if (!searchQuery) return chats;
    return chats.filter(chat => {
      if (chat.name) {
        return chat.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      const otherParticipant = chat.participants.find(p => p !== user?.id);
      if (otherParticipant) {
        const otherUser = getUserById(otherParticipant);
        return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return false;
    });
  }, [chats, searchQuery, user]);

  const getChatDisplayName = (chat: Chat): string => {
    if (chat.name) return chat.name;
    const otherParticipant = chat.participants.find(p => p !== user?.id);
    if (otherParticipant) {
      const otherUser = getUserById(otherParticipant);
      return otherUser?.name || 'Unknown User';
    }
    return 'Chat';
  };

  const getChatAvatar = (chat: Chat): string => {
    const name = getChatDisplayName(chat);
    return name.charAt(0).toUpperCase();
  };

  const getOtherUserStatus = (chat: Chat): User['status'] | undefined => {
    if (chat.type === 'group') return undefined;
    const otherParticipant = chat.participants.find(p => p !== user?.id);
    if (otherParticipant) {
      return getUserById(otherParticipant)?.status;
    }
    return undefined;
  };

  return (
    <div className="w-80 h-full bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Messages</h2>
          <div className="flex gap-1">
            <Button variant="icon" size="icon" onClick={onNewChat} title="New Chat">
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button variant="icon" size="icon" onClick={onNewGroup} title="New Group">
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat to begin messaging</p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const status = getOtherUserStatus(chat);
              return (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={cn(
                    "w-full p-3 rounded-lg flex items-center gap-3 transition-all duration-200 hover:bg-accent/50",
                    selectedChatId === chat.id && "bg-accent"
                  )}
                >
                  <div className="relative">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium",
                      chat.type === 'group' ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    )}>
                      {chat.type === 'group' ? <Users className="h-5 w-5" /> : getChatAvatar(chat)}
                    </div>
                    {status && (
                      <div className={cn(
                        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
                        status === 'online' && "bg-online",
                        status === 'away' && "bg-yellow-500",
                        status === 'offline' && "bg-offline"
                      )} />
                    )}
                  </div>
                  
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{getChatDisplayName(chat)}</span>
                      {chat.lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(chat.lastMessage.timestamp), { addSuffix: false })}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage.content}
                      </p>
                    )}
                  </div>

                  {chat.unreadCount > 0 && (
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {chat.unreadCount}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="flex-1" onClick={onOpenSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          {user?.isAdmin && (
            <Button variant="ghost" size="sm" className="flex-1" onClick={onOpenAdmin}>
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
