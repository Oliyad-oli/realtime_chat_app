import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getUsers, createUser } from '@/lib/storage';
import { User } from '@/types/chat';
import { 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  Mail, 
  Calendar,
  ArrowLeft,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const users = useMemo(() => getUsers(), []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const stats = useMemo(() => ({
    total: users.length,
    online: users.filter(u => u.status === 'online').length,
    admins: users.filter(u => u.isAdmin).length,
  }), [users]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      createUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
      });

      toast.success('User created successfully!');
      setIsAddUserOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
    } catch (error) {
      toast.error('Failed to create user');
    }

    setIsLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="h-16 px-6 border-b border-border flex items-center gap-4 bg-card">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Admin Panel</h2>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-online/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-online" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.online}</p>
                <p className="text-sm text-muted-foreground">Online Now</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-sm text-muted-foreground">Administrators</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">User Management</h3>
            <Button variant="gradient" onClick={() => setIsAddUserOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-3 bg-secondary/50 text-sm font-medium text-muted-foreground">
              <div className="col-span-4">User</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Joined</div>
              <div className="col-span-1">Role</div>
            </div>

            <ScrollArea className="h-64">
              {filteredUsers.map((u) => (
                <div 
                  key={u.id}
                  className="grid grid-cols-12 gap-4 p-3 border-t border-border items-center hover:bg-accent/30 transition-colors"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-medium text-sm">
                      {u.name.charAt(0)}
                    </div>
                    <span className="font-medium">{u.name}</span>
                  </div>
                  <div className="col-span-3 text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {u.email}
                  </div>
                  <div className="col-span-2">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                      u.status === 'online' && "bg-online/20 text-online",
                      u.status === 'away' && "bg-yellow-500/20 text-yellow-600",
                      u.status === 'offline' && "bg-muted text-muted-foreground"
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        u.status === 'online' && "bg-online",
                        u.status === 'away' && "bg-yellow-500",
                        u.status === 'offline' && "bg-muted-foreground"
                      )} />
                      {u.status}
                    </span>
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(u.createdAt), 'MMM d, yyyy')}
                  </div>
                  <div className="col-span-1">
                    {u.isAdmin && (
                      <Shield className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Add New User
            </DialogTitle>
            <DialogDescription>
              Create a new user account
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddUser} className="space-y-4">
            <Input
              placeholder="Full name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Email address"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              required
            />

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsAddUserOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="gradient" 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Create User'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
