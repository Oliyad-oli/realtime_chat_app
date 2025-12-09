import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserChats, getUsers } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Users, 
  Settings, 
  ArrowRight,
  Clock,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardHomeProps {
  onStartChat: () => void;
  onCreateGroup: () => void;
  onOpenSettings: () => void;
  onSelectChat: (chatId: string) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({
  onStartChat,
  onCreateGroup,
  onOpenSettings,
  onSelectChat,
}) => {
  const { user } = useAuth();
  const chats = user ? getUserChats(user.id).slice(0, 5) : [];
  const allUsers = getUsers();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex-1 bg-background overflow-auto">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {format(new Date(), 'EEEE, MMMM d, yyyy • h:mm a')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={onStartChat}
            className="glass-card rounded-xl p-6 text-left hover:shadow-elevated transition-all duration-300 group animate-slide-up"
            style={{ animationDelay: '100ms' }}
          >
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Start a Chat</h3>
            <p className="text-sm text-muted-foreground">
              Begin a new conversation with a contact
            </p>
          </button>

          <button
            onClick={onCreateGroup}
            className="glass-card rounded-xl p-6 text-left hover:shadow-elevated transition-all duration-300 group animate-slide-up"
            style={{ animationDelay: '200ms' }}
          >
            <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6 text-accent-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Create Group</h3>
            <p className="text-sm text-muted-foreground">
              Start a group chat with multiple people
            </p>
          </button>

          <button
            onClick={onOpenSettings}
            className="glass-card rounded-xl p-6 text-left hover:shadow-elevated transition-all duration-300 group animate-slide-up"
            style={{ animationDelay: '300ms' }}
          >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Settings className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Settings</h3>
            <p className="text-sm text-muted-foreground">
              Customize your experience
            </p>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-xl p-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-2 text-primary mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Total Chats</span>
            </div>
            <p className="text-2xl font-bold">{chats.length}</p>
          </div>

          <div className="glass-card rounded-xl p-4 animate-fade-in" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Contacts</span>
            </div>
            <p className="text-2xl font-bold">{allUsers.length - 1}</p>
          </div>

          <div className="glass-card rounded-xl p-4 animate-fade-in" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center gap-2 text-online mb-1">
              <div className="w-2 h-2 rounded-full bg-online" />
              <span className="text-sm font-medium">Online</span>
            </div>
            <p className="text-2xl font-bold">{allUsers.filter(u => u.status === 'online').length}</p>
          </div>

          <div className="glass-card rounded-xl p-4 animate-fade-in" style={{ animationDelay: '700ms' }}>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Groups</span>
            </div>
            <p className="text-2xl font-bold">{chats.filter(c => c.type === 'group').length}</p>
          </div>
        </div>

        {/* Recent Chats */}
        {chats.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: '800ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Conversations</h2>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-2">
              {chats.map((chat) => {
                const displayName = chat.name || 
                  (chat.participants.find(p => p !== user?.id) 
                    ? getUsers().find(u => u.id === chat.participants.find(p => p !== user?.id))?.name 
                    : 'Unknown');
                
                return (
                  <button
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className="w-full glass-card rounded-xl p-4 flex items-center gap-4 hover:shadow-elevated transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-medium ${
                      chat.type === 'group' ? 'gradient-primary text-primary-foreground' : 'bg-secondary'
                    }`}>
                      {chat.type === 'group' ? <Users className="h-5 w-5" /> : displayName?.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{displayName}</p>
                      {chat.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.lastMessage.content}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
