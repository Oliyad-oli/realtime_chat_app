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
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { getUsers, createChat } from '@/lib/storage';
import { Users, Search, ArrowRight, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (chatId: string) => void;
}

const NewGroupModal: React.FC<NewGroupModalProps> = ({ isOpen, onClose, onGroupCreated }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'select' | 'details'>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleNext = () => {
    if (selectedUsers.length < 2) {
      toast.error('Please select at least 2 members');
      return;
    }
    setStep('details');
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (!user) return;

    setIsLoading(true);

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const newGroup = createChat({
      type: 'group',
      participants: [user.id, ...selectedUsers],
      name: groupName.trim(),
      createdBy: user.id,
    });

    setIsLoading(false);
    toast.success('Group created successfully!');
    onGroupCreated(newGroup.id);
    handleClose();
  };

  const handleClose = () => {
    setStep('select');
    setSearchQuery('');
    setSelectedUsers([]);
    setGroupName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {step === 'select' ? 'Select Members' : 'Group Details'}
          </DialogTitle>
          <DialogDescription>
            {step === 'select' 
              ? 'Choose members for your group chat'
              : 'Give your group a name'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'select' ? (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(id => {
                  const selectedUser = users.find(u => u.id === id);
                  if (!selectedUser) return null;
                  return (
                    <div 
                      key={id} 
                      className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {selectedUser.name}
                      <button 
                        onClick={() => toggleUser(id)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <ScrollArea className="h-48">
              <div className="space-y-1">
                {filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => toggleUser(u.id)}
                    className="w-full p-3 rounded-lg flex items-center gap-3 transition-all duration-200 hover:bg-accent"
                  >
                    <Checkbox checked={selectedUsers.includes(u.id)} />
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-medium">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{u.name}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>

            <Button 
              variant="gradient" 
              className="w-full"
              onClick={handleNext}
              disabled={selectedUsers.length < 2}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>

              <Input
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="text-center"
              />

              <p className="text-sm text-muted-foreground text-center">
                {selectedUsers.length + 1} members
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep('select')}>
                Back
              </Button>
              <Button 
                variant="gradient" 
                className="flex-1"
                onClick={handleCreate}
                disabled={isLoading || !groupName.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Create Group'
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewGroupModal;
