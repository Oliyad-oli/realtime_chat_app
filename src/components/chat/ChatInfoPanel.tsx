import React, { useMemo } from 'react';
import { getChatById, getUserById, getUsers } from '@/lib/storage';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Users, Image, File, Link2, Bell, Trash2, UserPlus, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInfoPanelProps {
  chatId: string;
  onClose: () => void;
}

const ChatInfoPanel: React.FC<ChatInfoPanelProps> = ({ chatId, onClose }) => {
  const { user } = useAuth();
  const chat = useMemo(() => getChatById(chatId), [chatId]);

  const participants = useMemo(() => {
    if (!chat) return [];
    return chat.participants
      .map(id => getUserById(id))
      .filter(Boolean);
  }, [chat]);

  const chatPartner = useMemo(() => {
    if (!chat || chat.type === 'group' || !user) return null;
    const partnerId = chat.participants.find(p => p !== user.id);
    return partnerId ? getUserById(partnerId) : null;
  }, [chat, user]);

  if (!chat) return null;

  const isGroup = chat.type === 'group';
  const displayName = isGroup ? chat.name : chatPartner?.name || 'Unknown';

  return (
    <div className="w-80 h-full bg-card border-l border-border flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="h-16 px-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold">{isGroup ? 'Group Info' : 'Contact Info'}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Profile */}
          <div className="text-center">
            <div className={cn(
              "w-24 h-24 rounded-full mx-auto flex items-center justify-center text-3xl font-medium mb-3",
              isGroup ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            )}>
              {isGroup ? <Users className="h-10 w-10" /> : displayName.charAt(0)}
            </div>
            <h4 className="text-lg font-semibold">{displayName}</h4>
            {!isGroup && chatPartner && (
              <p className="text-sm text-muted-foreground">{chatPartner.email}</p>
            )}
            {isGroup && (
              <p className="text-sm text-muted-foreground">
                {participants.length} members
              </p>
            )}
          </div>

          {/* Status */}
          {!isGroup && chatPartner && (
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium capitalize flex items-center gap-2">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  chatPartner.status === 'online' && "bg-online",
                  chatPartner.status === 'away' && "bg-yellow-500",
                  chatPartner.status === 'offline' && "bg-offline"
                )} />
                {chatPartner.status}
              </p>
            </div>
          )}

          {/* Members */}
          {isGroup && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium">Members</h5>
                <Button variant="ghost" size="sm">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {participants.map((p) => (
                  <div 
                    key={p!.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-medium">
                        {p!.name.charAt(0)}
                      </div>
                      <div className={cn(
                        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
                        p!.status === 'online' && "bg-online",
                        p!.status === 'away' && "bg-yellow-500",
                        p!.status === 'offline' && "bg-offline"
                      )} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{p!.name}</p>
                      <p className="text-xs text-muted-foreground">{p!.email}</p>
                    </div>
                    {p!.id === chat.createdBy && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media & Files */}
          <div>
            <h5 className="font-medium mb-3">Media & Files</h5>
            <div className="grid grid-cols-3 gap-2">
              <button className="p-4 bg-secondary/50 rounded-lg flex flex-col items-center gap-1 hover:bg-secondary transition-colors">
                <Image className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Photos</span>
              </button>
              <button className="p-4 bg-secondary/50 rounded-lg flex flex-col items-center gap-1 hover:bg-secondary transition-colors">
                <File className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Files</span>
              </button>
              <button className="p-4 bg-secondary/50 rounded-lg flex flex-col items-center gap-1 hover:bg-secondary transition-colors">
                <Link2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Links</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="h-4 w-4 mr-3" />
              Mute Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-3" />
              Delete Chat
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatInfoPanel;
