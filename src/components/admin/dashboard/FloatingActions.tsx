
import { Button } from '@/components/ui/button';
import { Zap, Bell, Users, Monitor } from 'lucide-react';
import FloatingDepartmentOverview from '../FloatingDepartmentOverview';
import type { Ticket } from '@/types/admin';

interface FloatingActionsProps {
  tickets: Ticket[];
  totalNotifications: number;
  referralCount: number;
  onOpenEscalatedTickets: () => void;
  onToggleNotifications: () => void;
  onOpenDigitalizationTeam: () => void;
  onOpenITTeam: () => void;
}

const FloatingActions = ({
  tickets,
  totalNotifications,
  referralCount,
  onOpenEscalatedTickets,
  onToggleNotifications,
  onOpenDigitalizationTeam,
  onOpenITTeam
}: FloatingActionsProps) => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-40">
      {/* Floating Department Overview */}
      <FloatingDepartmentOverview tickets={tickets} />
      
      {/* Notifications Toggle Button */}
      <Button
        onClick={onToggleNotifications}
        className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 hover:scale-105 relative"
        title="View Notifications"
      >
        <Bell className="w-6 h-6" />
        {totalNotifications > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalNotifications}
          </span>
        )}
        {referralCount > 0 && (
          <span className="absolute -bottom-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {referralCount}
          </span>
        )}
      </Button>
      
      {/* Floating Escalated Tickets Button */}
      <Button
        onClick={onOpenEscalatedTickets}
        className="rounded-full w-12 h-12 bg-orange-600 hover:bg-orange-700 text-white shadow-lg transition-all duration-200 hover:scale-105"
        title="Escalated to Infosoft Dev"
      >
        <Zap className="w-6 h-6" />
      </Button>

      {/* Digitalization Team Button */}
      <Button
        onClick={onOpenDigitalizationTeam}
        className="rounded-full w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-all duration-200 hover:scale-105"
        title="Manage Digitalization Team"
      >
        <Users className="w-6 h-6" />
      </Button>

      {/* IT Team Button */}
      <Button
        onClick={onOpenITTeam}
        className="rounded-full w-12 h-12 bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-200 hover:scale-105"
        title="Manage IT Team"
      >
        <Monitor className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default FloatingActions;
