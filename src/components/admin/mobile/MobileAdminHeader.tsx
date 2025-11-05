import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Bell, BellOff, LogOut, Users, Building2, Image, BarChart3, PieChart, Bookmark, Settings, UsersRound, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DepartmentAvatar from '@/components/shared/DepartmentAvatar';
import ThemeSelector from '@/components/ThemeSelector';
import AdminProfileManager from '@/components/admin/AdminProfileManager';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface MobileAdminHeaderProps {
  profileName: string;
  departmentCode?: string;
  onSignOut: () => void;
  onViewUsers?: () => void;
  onViewDepartmentUsers?: () => void;
  onViewDepartmentImages?: () => void;
  onViewAdminAnalysis?: () => void;
  onViewTicketAnalysis?: () => void;
  onViewBookmarks?: () => void;
  onDepartmentLogoClick?: () => void;
  onClearNotifications?: () => void;
  hasNotifications?: boolean;
  totalNotifications?: number;
  onOpenTeamManager?: () => void;
  onOpenITTeam?: () => void;
  onOpenBranding?: () => void;
  onOpenLogo?: () => void;
}

const MobileAdminHeader = ({
  profileName,
  departmentCode,
  onSignOut,
  onViewUsers,
  onViewDepartmentUsers,
  onViewDepartmentImages,
  onViewAdminAnalysis,
  onViewTicketAnalysis,
  onViewBookmarks,
  onDepartmentLogoClick,
  onClearNotifications,
  hasNotifications,
  totalNotifications = 0,
  onOpenTeamManager,
  onOpenITTeam,
  onOpenBranding,
  onOpenLogo
}: MobileAdminHeaderProps) => {
  const [departmentInfo, setDepartmentInfo] = useState<{
    name: string;
    image_url?: string;
  } | null>(null);
  const [adminProfile, setAdminProfile] = useState<{
    avatar_url?: string;
    full_name: string;
  } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch department and admin info
  useEffect(() => {
    const fetchInfo = async () => {
      if (!departmentCode) return;

      try {
        const { data } = await supabase
          .from('departments')
          .select('name, image_url')
          .eq('code', departmentCode)
          .single();

        if (data) setDepartmentInfo(data);
      } catch (error) {
        console.error('Error fetching department info:', error);
      }
    };

    fetchInfo();
  }, [departmentCode]);

  const handleMenuItemClick = (action?: () => void) => {
    setIsMenuOpen(false);
    if (action) {
      setTimeout(() => action(), 100);
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-card shadow-md border-b border-border">
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Title */}
          <div 
            className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer active:scale-95 transition-transform"
            onClick={onDepartmentLogoClick}
          >
            <DepartmentAvatar
              departmentCode={departmentCode || ''}
              departmentName={departmentInfo?.name || ''}
              imageUrl={departmentInfo?.image_url}
              size="md"
              showOriginalFormat={true}
              className="flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold text-foreground truncate">Admin Panel</h1>
              <p className="text-xs text-muted-foreground truncate">
                {profileName.split(' ')[0]} • {departmentCode}
              </p>
            </div>
          </div>

          {/* Right: Notifications + Menu */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Notification Bell */}
            {hasNotifications && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 relative"
                onClick={onClearNotifications}
              >
                <Bell className="h-5 w-5 text-orange-600" />
                {totalNotifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full"
                  >
                    {totalNotifications > 99 ? '99+' : totalNotifications}
                  </Badge>
                )}
              </Button>
            )}

            {/* Hamburger Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-sm p-0">
                <ScrollArea className="h-full">
                  {/* Profile Section */}
                  <div className="p-6 bg-primary/5 border-b">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16 border-2 border-primary/20">
                        <AvatarImage src={adminProfile?.avatar_url} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {profileName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-lg text-foreground truncate">
                          {profileName}
                        </h2>
                        <p className="text-sm text-muted-foreground">Administrator</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {departmentInfo?.name || departmentCode}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <AdminProfileManager />
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    {/* Views Section */}
                    <div className="px-4 py-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Data & Analytics
                      </p>
                    </div>
                    
                    <MenuItem
                      icon={<Users className="w-5 h-5" />}
                      label="User Presence"
                      description="View active users by department"
                      onClick={() => handleMenuItemClick(onViewUsers)}
                    />
                    <MenuItem
                      icon={<Building2 className="w-5 h-5" />}
                      label="Department Users"
                      description="Manage department members"
                      onClick={() => handleMenuItemClick(onViewDepartmentUsers)}
                    />
                    <MenuItem
                      icon={<Image className="w-5 h-5" />}
                      label="Department Images"
                      description="Manage profile images"
                      onClick={() => handleMenuItemClick(onViewDepartmentImages)}
                    />
                    <MenuItem
                      icon={<BarChart3 className="w-5 h-5" />}
                      label="Admin Analysis"
                      description="Performance metrics"
                      onClick={() => handleMenuItemClick(onViewAdminAnalysis)}
                    />
                    <MenuItem
                      icon={<PieChart className="w-5 h-5" />}
                      label="Ticket Analysis"
                      description="Ticket statistics & insights"
                      onClick={() => handleMenuItemClick(onViewTicketAnalysis)}
                    />
                    <MenuItem
                      icon={<Bookmark className="w-5 h-5" />}
                      label="My Bookmarks"
                      description="Saved tickets"
                      onClick={() => handleMenuItemClick(onViewBookmarks)}
                    />

                    <Separator className="my-2" />

                    {/* System Management */}
                    <div className="px-4 py-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        System Management
                      </p>
                    </div>
                    
                    <MenuItem
                      icon={<UsersRound className="w-5 h-5" />}
                      label="Digitalization Team"
                      description="Manage team members"
                      onClick={() => handleMenuItemClick(onOpenTeamManager)}
                    />
                    <MenuItem
                      icon={<Settings className="w-5 h-5" />}
                      label="IT Team"
                      description="Manage IT staff"
                      onClick={() => handleMenuItemClick(onOpenITTeam)}
                    />
                    <MenuItem
                      icon={<Image className="w-5 h-5" />}
                      label="Branding"
                      description="System branding settings"
                      onClick={() => handleMenuItemClick(onOpenBranding)}
                    />
                    <MenuItem
                      icon={<Crown className="w-5 h-5" />}
                      label="Logo Manager"
                      description="Manage system logo"
                      onClick={() => handleMenuItemClick(onOpenLogo)}
                    />

                    <Separator className="my-2" />

                    {/* Settings */}
                    <div className="px-4 py-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Settings
                      </p>
                    </div>

                    <div className="px-4 py-3">
                      <p className="text-xs text-muted-foreground mb-2">Theme</p>
                      <ThemeSelector />
                    </div>

                    {onClearNotifications && (
                      <div className="px-4 py-2">
                        <Button
                          variant={hasNotifications ? "default" : "outline"}
                          onClick={() => handleMenuItemClick(onClearNotifications)}
                          className="w-full justify-start"
                          disabled={!hasNotifications}
                        >
                          {hasNotifications ? (
                            <BellOff className="w-4 h-4 mr-2" />
                          ) : (
                            <Bell className="w-4 h-4 mr-2" />
                          )}
                          Clear All Notifications
                          {hasNotifications && totalNotifications > 0 && (
                            <Badge variant="secondary" className="ml-auto">
                              {totalNotifications}
                            </Badge>
                          )}
                        </Button>
                      </div>
                    )}

                    <Separator className="my-2" />

                    {/* Logout */}
                    <div className="px-4 py-2">
                      <Button
                        variant="outline"
                        onClick={() => handleMenuItemClick(onSignOut)}
                        className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
};

// Menu Item Component
const MenuItem = ({
  icon,
  label,
  description,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-accent transition-colors text-left active:scale-[0.98]"
  >
    <div className="text-primary mt-0.5">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-sm text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
  </button>
);

export default MobileAdminHeader;

