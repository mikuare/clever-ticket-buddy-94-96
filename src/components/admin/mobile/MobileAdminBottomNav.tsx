import { Home, TicketIcon, Bell, TrendingUp, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type MobileAdminTab = 'dashboard' | 'tickets' | 'notifications' | 'analytics' | 'more';

interface MobileAdminBottomNavProps {
  activeTab: MobileAdminTab;
  onTabChange: (tab: MobileAdminTab) => void;
  notificationCount?: number;
  ticketCount?: number;
}

const MobileAdminBottomNav = ({
  activeTab,
  onTabChange,
  notificationCount = 0,
  ticketCount = 0
}: MobileAdminBottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-lg md:hidden">
      <div className="grid grid-cols-5 h-16">
        <NavItem
          icon={<Home className="w-5 h-5" />}
          label="Dashboard"
          active={activeTab === 'dashboard'}
          onClick={() => onTabChange('dashboard')}
        />
        <NavItem
          icon={<TicketIcon className="w-5 h-5" />}
          label="Tickets"
          active={activeTab === 'tickets'}
          onClick={() => onTabChange('tickets')}
          badge={ticketCount > 0 ? ticketCount : undefined}
        />
        <NavItem
          icon={<Bell className="w-5 h-5" />}
          label="Alerts"
          active={activeTab === 'notifications'}
          onClick={() => onTabChange('notifications')}
          badge={notificationCount > 0 ? notificationCount : undefined}
        />
        <NavItem
          icon={<TrendingUp className="w-5 h-5" />}
          label="Analytics"
          active={activeTab === 'analytics'}
          onClick={() => onTabChange('analytics')}
        />
        <NavItem
          icon={<Menu className="w-5 h-5" />}
          label="More"
          active={activeTab === 'more'}
          onClick={() => onTabChange('more')}
        />
      </div>
    </div>
  );
};

const NavItem = ({
  icon,
  label,
  active,
  onClick,
  badge
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) => (
  <button
    onClick={onClick}
    className={cn(
      'flex flex-col items-center justify-center gap-1 transition-colors relative active:scale-95',
      active
        ? 'text-primary bg-primary/5'
        : 'text-muted-foreground hover:text-foreground'
    )}
  >
    <div className="relative">
      {icon}
      {badge !== undefined && badge > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-4 min-w-4 px-1 flex items-center justify-center text-[10px] rounded-full"
        >
          {badge > 99 ? '99+' : badge}
        </Badge>
      )}
    </div>
    <span className={cn('text-[10px] font-medium', active && 'font-semibold')}>
      {label}
    </span>
    {active && (
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary rounded-b-full" />
    )}
  </button>
);

export default MobileAdminBottomNav;

