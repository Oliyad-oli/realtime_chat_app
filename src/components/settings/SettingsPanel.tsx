import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import LogoutModal from '@/components/auth/LogoutModal';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  LogOut,
  Camera,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface SettingsPanelProps {
  onBack: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onBack }) => {
  const { user, updateCurrentUser } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    messages: true,
    groups: true,
    sounds: true,
    desktop: false,
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    updateCurrentUser({ name });
    setIsSaving(false);
    toast.success('Profile updated successfully');
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="h-16 px-6 border-b border-border flex items-center gap-4 bg-card">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">Settings</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-2xl mx-auto p-6 space-y-8">
          {/* Profile Section */}
          <section className="glass-card rounded-xl p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Profile</h3>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-3xl font-medium">
                    {user?.name?.charAt(0)}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-soft">
                    <Camera className="h-4 w-4 text-primary-foreground" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">Change avatar</p>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="mt-1 bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <Button 
                  variant="gradient" 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="glass-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Notifications</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Message Notifications</p>
                  <p className="text-sm text-muted-foreground">Get notified for new messages</p>
                </div>
                <Switch
                  checked={notifications.messages}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, messages: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Group Updates</p>
                  <p className="text-sm text-muted-foreground">Notifications for group activities</p>
                </div>
                <Switch
                  checked={notifications.groups}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, groups: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sound Effects</p>
                  <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
                </div>
                <Switch
                  checked={notifications.sounds}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, sounds: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Desktop Notifications</p>
                  <p className="text-sm text-muted-foreground">Show browser notifications</p>
                </div>
                <Switch
                  checked={notifications.desktop}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, desktop: checked })
                  }
                />
              </div>
            </div>
          </section>

          {/* Privacy Section */}
          <section className="glass-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Privacy & Security</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Online Status</p>
                  <p className="text-sm text-muted-foreground">Let others see when you're online</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Read Receipts</p>
                  <p className="text-sm text-muted-foreground">Let others know when you've read messages</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Typing Indicators</p>
                  <p className="text-sm text-muted-foreground">Show when you're typing a message</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section className="glass-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <Palette className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Appearance</h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-medium mb-3">Theme</p>
                <div className="flex gap-3">
                  <button className="flex-1 p-4 rounded-xl border-2 border-primary bg-card flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-background border" />
                    <span className="text-sm font-medium">Light</span>
                  </button>
                  <button className="flex-1 p-4 rounded-xl border border-border bg-card flex flex-col items-center gap-2 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-gray-800" />
                    <span className="text-sm">Dark</span>
                  </button>
                  <button className="flex-1 p-4 rounded-xl border border-border bg-card flex flex-col items-center gap-2 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-b from-background to-gray-800" />
                    <span className="text-sm">System</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Logout Section */}
          <section className="glass-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => setIsLogoutOpen(true)}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </section>
        </div>
      </ScrollArea>

      <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />
    </div>
  );
};

export default SettingsPanel;
