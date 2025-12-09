import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatView from '@/components/chat/ChatView';
import ChatInfoPanel from '@/components/chat/ChatInfoPanel';
import DashboardHome from '@/components/dashboard/DashboardHome';
import NewChatModal from '@/components/chat/NewChatModal';
import NewGroupModal from '@/components/chat/NewGroupModal';
import SettingsPanel from '@/components/settings/SettingsPanel';
import AdminPanel from '@/components/admin/AdminPanel';
import LogoutModal from '@/components/auth/LogoutModal';
import { Button } from '@/components/ui/button';
import { MessageCircle, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

type View = 'home' | 'chat' | 'settings' | 'admin';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [view, setView] = useState<View>('home');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setView('chat');
    setShowMobileSidebar(false);
  };

  const handleChatCreated = (chatId: string) => {
    handleSelectChat(chatId);
  };

  const handleBackToHome = () => {
    setView('home');
    setSelectedChatId(null);
    setShowInfo(false);
  };

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            >
              {showMobileSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold hidden sm:inline">ChatApp</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-medium text-sm">
              {user.name.charAt(0)}
            </div>
            <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowLogout(true)}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <div className={cn(
          "absolute inset-y-0 left-0 z-20 transition-transform duration-300 lg:relative lg:translate-x-0",
          isMobile && !showMobileSidebar && "-translate-x-full"
        )}>
          <ChatSidebar
            selectedChatId={selectedChatId}
            onSelectChat={handleSelectChat}
            onNewChat={() => setShowNewChat(true)}
            onNewGroup={() => setShowNewGroup(true)}
            onOpenSettings={() => { setView('settings'); setShowMobileSidebar(false); }}
            onOpenAdmin={() => { setView('admin'); setShowMobileSidebar(false); }}
          />
        </div>

        {/* Mobile Overlay */}
        {isMobile && showMobileSidebar && (
          <div 
            className="absolute inset-0 bg-black/50 z-10"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Main Area */}
        {view === 'home' && (
          <DashboardHome
            onStartChat={() => setShowNewChat(true)}
            onCreateGroup={() => setShowNewGroup(true)}
            onOpenSettings={() => setView('settings')}
            onSelectChat={handleSelectChat}
          />
        )}

        {view === 'chat' && selectedChatId && (
          <ChatView
            chatId={selectedChatId}
            onOpenInfo={() => setShowInfo(true)}
          />
        )}

        {view === 'settings' && (
          <SettingsPanel onBack={handleBackToHome} />
        )}

        {view === 'admin' && (
          <AdminPanel onBack={handleBackToHome} />
        )}

        {/* Info Panel */}
        {showInfo && selectedChatId && (
          <ChatInfoPanel
            chatId={selectedChatId}
            onClose={() => setShowInfo(false)}
          />
        )}
      </div>

      {/* Modals */}
      <NewChatModal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        onChatCreated={handleChatCreated}
      />
      
      <NewGroupModal
        isOpen={showNewGroup}
        onClose={() => setShowNewGroup(false)}
        onGroupCreated={handleChatCreated}
      />

      <LogoutModal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
      />
    </div>
  );
};

export default Dashboard;
