import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, Users, ChevronDown, Building2, Image, BarChart3, PieChart, Bookmark, Bell, BellOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ThemeSelector from '@/components/ThemeSelector';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { AnimatedText } from '@/components/ui/animated-text';
import DepartmentAvatar from '@/components/shared/DepartmentAvatar';
import AdminProfileManager from '@/components/admin/AdminProfileManager';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardHeaderProps {
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
}

const DashboardHeader = ({ 
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
  hasNotifications
}: DashboardHeaderProps) => {
  const { profile } = useAuth();
  const [departmentInfo, setDepartmentInfo] = useState<{
    name: string;
    image_url?: string;
    updated_at?: string;
  } | null>(null);
  const [adminProfile, setAdminProfile] = useState<{
    avatar_url?: string;
    full_name: string;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch department information
  useEffect(() => {
    const fetchDepartmentInfo = async () => {
      if (!departmentCode) return;

      try {
        console.log(`Fetching department info for admin header: ${departmentCode}`);
        const { data, error } = await supabase
          .from('departments')
          .select('name, image_url, updated_at')
          .eq('code', departmentCode)
          .single();

        if (error) {
          console.error('Error fetching department info:', error);
          return;
        }

        console.log(`Department info fetched for ${departmentCode}:`, data);
        setDepartmentInfo(data);
      } catch (error) {
        console.error('Error fetching department info:', error);
      }
    };

    fetchDepartmentInfo();
  }, [departmentCode, refreshKey]);

  // Fetch and track admin profile changes
  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!profile?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url, full_name')
          .eq('id', profile.id)
          .single();

        if (error) {
          console.error('Error fetching admin profile:', error);
          return;
        }

        setAdminProfile(data);
      } catch (error) {
        console.error('Error fetching admin profile:', error);
      }
    };

    fetchAdminProfile();

    // Set up real-time subscription for admin profile changes
    if (profile?.id) {
      const subscription = supabase
        .channel(`admin-profile-${profile.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${profile.id}`
          },
          (payload) => {
            console.log('Admin profile updated:', payload);
            const updatedProfile = payload.new as any;
            setAdminProfile({
              avatar_url: updatedProfile.avatar_url,
              full_name: updatedProfile.full_name
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [profile?.id]);

  // Real-time subscription for department image updates
  useEffect(() => {
    if (!departmentCode) return;

    console.log(`Setting up real-time subscription for ${departmentCode} department in admin header`);
    
    const channel = supabase
      .channel(`admin-header-dept-${departmentCode}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'departments',
          filter: `code=eq.${departmentCode}`
        },
        (payload) => {
          console.log(`Admin header: Department ${departmentCode} updated:`, payload);
          const updatedDept = payload.new as any;
          
          setDepartmentInfo({
            name: updatedDept.name,
            image_url: updatedDept.image_url ? `${updatedDept.image_url}?header_refresh=${Date.now()}` : undefined,
            updated_at: updatedDept.updated_at
          });
          
          // Force refresh to ensure image is updated
          setRefreshKey(prev => prev + 1);
          
          console.log(`✓ Admin header updated for ${departmentCode} department`);
        }
      )
      .subscribe((status) => {
        console.log(`Admin header subscription status for ${departmentCode}:`, status);
      });

    return () => {
      console.log(`Cleaning up admin header subscription for ${departmentCode}`);
      supabase.removeChannel(channel);
    };
  }, [departmentCode]);

  const handleSignOut = async () => {
    try {
      console.log('Admin Header: Starting sign out process...');
      
      // Call the parent sign out handler which already handles cleanup
      await onSignOut();
      
      console.log('Admin Header: Sign out completed');
      
    } catch (error) {
      console.error('Admin Header: Sign out error:', error);
      // Force redirect on error
      window.location.href = '/';
    }
  };

  const handleDepartmentLogoClick = () => {
    console.log('Department logo clicked - navigating back to main dashboard');
    if (onDepartmentLogoClick) {
      onDepartmentLogoClick();
    }
  };

  return (
    <AnimatedContainer variant="header" className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <AnimatedContainer variant="content">
            <div className="flex items-center gap-4">
              {departmentCode && (
                <DepartmentAvatar
                  departmentCode={departmentCode}
                  departmentName={departmentInfo?.name || departmentCode}
                  imageUrl={departmentInfo?.image_url}
                  size="lg"
                  showOriginalFormat={true}
                  className="shadow-md hover:shadow-lg cursor-pointer"
                  clickable={true}
                  onClick={handleDepartmentLogoClick}
                />
              )}
              <div>
                <AnimatedText as="h1" variant="title" className="text-2xl font-bold text-foreground">
                  Admin Dashboard
                </AnimatedText>
                <AnimatedText variant="subtitle" className="text-muted-foreground">
                  Welcome, {profileName} - Administrator
                  {departmentCode && ` (${departmentCode})`}
                </AnimatedText>
              </div>
            </div>
          </AnimatedContainer>
          
          <div className="flex items-center gap-4">
            {/* Admin Profile Avatar - Circular format */}
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-primary/20">
                <AvatarImage src={adminProfile?.avatar_url} alt="Admin Profile" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {adminProfile?.full_name?.split(' ').map(n => n[0]).join('') || 'AD'}
                </AvatarFallback>
              </Avatar>
              <AdminProfileManager />
            </div>
            
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  View Users
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuItem onClick={onViewUsers}>
                  <Users className="w-4 h-4 mr-2" />
                  User Presence by Department
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onViewDepartmentUsers}>
                  <Building2 className="w-4 h-4 mr-2" />
                  Department User Management
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onViewDepartmentImages}>
                  <Image className="w-4 h-4 mr-2" />
                  Department Profile Images
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onViewAdminAnalysis}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Admin Analysis
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onViewTicketAnalysis}>
                  <PieChart className="w-4 h-4 mr-2" />
                  Ticket Analysis
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onViewBookmarks}>
                  <Bookmark className="w-4 h-4 mr-2" />
                  My Bookmarks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all duration-200"
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

export default DashboardHeader;
