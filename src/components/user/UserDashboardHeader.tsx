import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, Bell, BellOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ThemeSelector from '@/components/ThemeSelector';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { AnimatedText } from '@/components/ui/animated-text';
import DepartmentAvatar from '@/components/shared/DepartmentAvatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import UserProfileManager from '@/components/user/UserProfileManager';

interface UserDashboardHeaderProps {
  onClearNotifications?: () => void;
  hasNotifications?: boolean;
}

const UserDashboardHeader = ({ onClearNotifications, hasNotifications }: UserDashboardHeaderProps) => {
  const { profile, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [departmentInfo, setDepartmentInfo] = useState<{
    name: string;
    image_url?: string;
  } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const fetchDepartmentInfo = async () => {
      if (!profile?.department_code) return;

      try {
        const { data, error } = await supabase
          .from('departments')
          .select('name, image_url')
          .eq('code', profile.department_code)
          .single();

        if (error) {
          console.error('Error fetching department info:', error);
          return;
        }

        setDepartmentInfo(data);
      } catch (error) {
        console.error('Error fetching department info:', error);
      }
    };

    fetchDepartmentInfo();
  }, [profile?.department_code]);

  const handleSignOut = async () => {
    try {
      console.log('Header: Starting sign out...');
      await signOut();
    } catch (error) {
      console.error('Header: Failed to sign out:', error);
    }
  };

  if (isMobile) {
    return (
      <AnimatedContainer variant="header" className="bg-card shadow-sm border-b border-border theme-transition sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DepartmentAvatar
                departmentCode={profile?.department_code || ''}
                departmentName={departmentInfo?.name || ''}
                imageUrl={departmentInfo?.image_url || undefined}
                size="md"
                showOriginalFormat={true}
              />
              <div className="min-w-0">
                <AnimatedText as="h1" variant="title" className="text-lg font-semibold text-foreground truncate">
                  Dashboard
                </AnimatedText>
                <AnimatedText variant="subtitle" className="text-xs text-muted-foreground truncate">
                  {profile?.full_name} ({profile?.department_code})
                </AnimatedText>
              </div>
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="space-y-6 py-4">
                  <div className="text-center">
                    <DepartmentAvatar
                      departmentCode={profile?.department_code || ''}
                      departmentName={departmentInfo?.name || ''}
                      imageUrl={departmentInfo?.image_url || undefined}
                      size="lg"
                      showOriginalFormat={true}
                    />
                    <h2 className="mt-3 text-xl font-semibold text-foreground">
                      {profile?.full_name || 'User'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {departmentInfo?.name || profile?.department_code || 'No Department'}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-3">Theme Settings</h3>
                      <ThemeSelector />
                    </div>

                    {onClearNotifications && (
                      <Button 
                        variant={hasNotifications ? "default" : "outline"}
                        onClick={onClearNotifications}
                        className="w-full"
                        size="sm"
                        disabled={!hasNotifications}
                      >
                        {hasNotifications ? <BellOff className="w-4 h-4 mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
                        Clear Notifications
                      </Button>
                    )}
                    
                    {profile?.is_admin && (
                      <Button 
                        variant="default" 
                        onClick={() => setProfileOpen(true)}
                        className="w-full"
                        size="sm"
                      >
                        Edit Profile
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      onClick={handleSignOut}
                      className="w-full"
                      size="sm"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <UserProfileManager isOpen={profileOpen} onOpenChange={setProfileOpen} />
        </div>
      </AnimatedContainer>
    );
  }

  return (
    <AnimatedContainer variant="header" className="bg-card shadow-sm border-b border-border theme-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <AnimatedContainer variant="content">
            <div className="flex items-center gap-4">
              <DepartmentAvatar
                departmentCode={profile?.department_code || ''}
                departmentName={departmentInfo?.name || ''}
                imageUrl={departmentInfo?.image_url || undefined}
                size="lg"
                showOriginalFormat={true}
              />
              <div>
                <AnimatedText as="h1" variant="title" className="text-2xl font-bold text-foreground">
                  User Dashboard
                </AnimatedText>
                <AnimatedText variant="subtitle" className="text-muted-foreground">
                  Welcome, {profile?.full_name} ({profile?.department_code})
                </AnimatedText>
              </div>
            </div>
          </AnimatedContainer>
          <div className="flex items-center gap-4">
            <ThemeSelector />
            
            {onClearNotifications && (
              <Button 
                variant={hasNotifications ? "default" : "outline"}
                onClick={onClearNotifications}
                className="button-hover-scale"
                disabled={!hasNotifications}
              >
                {hasNotifications ? <BellOff className="w-4 h-4 mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
                Clear Notifications
              </Button>
            )}
            
            {profile?.is_admin && (
              <Button 
                variant="outline" 
                onClick={() => setProfileOpen(true)}
                className="button-hover-scale"
              >
                Edit Profile
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="button-hover-scale"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default UserDashboardHeader;
