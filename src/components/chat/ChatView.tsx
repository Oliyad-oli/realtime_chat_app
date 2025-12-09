import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getChatById, getChatMessages, getUserById, createMessage } from '@/lib/storage';
import { Message, Chat, User } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Image, MoreVertical, Phone, Video, Info, Check, CheckCheck, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatViewProps {
  chatId: string;
  onOpenInfo: () => void;
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-1 px-3 py-2">
    <div className="w-2 h-2 rounded-full bg-typing animate-typing-dot-1" />
    <div className="w-2 h-2 rounded-full bg-typing animate-typing-dot-2" />
    <div className="w-2 h-2 rounded-full bg-typing animate-typing-dot-3" />
  </div>
);

const MessageBubble: React.FC<{ message: Message; isSent: boolean; senderName?: string }> = ({ 
  message, 
  isSent,
  senderName 
}) => {
  return (
    <div className={cn(
      "flex w-full animate-fade-in",
      isSent ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[70%] rounded-2xl px-4 py-2 shadow-soft",
        isSent ? "message-sent rounded-br-md" : "message-received rounded-bl-md"
      )}>
        {senderName && !isSent && (
          <p className="text-xs font-medium text-primary mb-1">{senderName}</p>
        )}
        {message.type === 'image' && message.imageUrl && (
          <img 
            src={message.imageUrl} 
            alt="Shared image" 
            className="rounded-lg mb-2 max-w-full"
          />
        )}
        <p className="text-sm">{message.content}</p>
        <div className={cn(
          "flex items-center justify-end gap-1 mt-1",
          isSent ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          <span className="text-xs">{format(new Date(message.timestamp), 'HH:mm')}</span>
          {isSent && (
            message.status === 'read' ? (
              <CheckCheck className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            )
          )}
        </div>
      </div>
    </div>
  );
};

const ChatView: React.FC<ChatViewProps> = ({ chatId, onOpenInfo }) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chat = useMemo(() => getChatById(chatId), [chatId]);
  
  const chatPartner = useMemo(() => {
    if (!chat || chat.type === 'group' || !user) return null;
    const partnerId = chat.participants.find(p => p !== user.id);
    return partnerId ? getUserById(partnerId) : null;
  }, [chat, user]);

  useEffect(() => {
    setMessages(getChatMessages(chatId));
  }, [chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message = createMessage({
      content: newMessage.trim(),
      senderId: user.id,
      chatId: chatId,
      type: 'text',
    });

    setMessages([...messages, message]);
    setNewMessage('');
    inputRef.current?.focus();

    // Simulate typing indicator from other user
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }, 500);
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Chat not found</p>
      </div>
    );
  }

  const getChatDisplayName = () => {
    if (chat.name) return chat.name;
    return chatPartner?.name || 'Unknown User';
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="h-16 px-4 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-medium",
              chat.type === 'group' ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            )}>
              {chat.type === 'group' ? <Users className="h-4 w-4" /> : getChatDisplayName().charAt(0)}
            </div>
            {chatPartner && (
              <div className={cn(
                "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
                chatPartner.status === 'online' && "bg-online",
                chatPartner.status === 'away' && "bg-yellow-500",
                chatPartner.status === 'offline' && "bg-offline"
              )} />
            )}
          </div>
          <div>
            <h3 className="font-medium">{getChatDisplayName()}</h3>
            <p className="text-xs text-muted-foreground">
              {chat.type === 'group' 
                ? `${chat.participants.length} members`
                : chatPartner?.status || 'offline'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onOpenInfo}>
            <Info className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {messages.map((message) => {
            const isSent = message.senderId === user?.id;
            const senderName = chat.type === 'group' && !isSent 
              ? getUserById(message.senderId)?.name 
              : undefined;
            
            return (
              <MessageBubble 
                key={message.id} 
                message={message} 
                isSent={isSent}
                senderName={senderName}
              />
            );
          })}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="message-received rounded-2xl rounded-bl-md shadow-soft">
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon">
            <Image className="h-5 w-5" />
          </Button>
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="gradient" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatView;
