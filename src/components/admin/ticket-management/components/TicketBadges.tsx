
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { getStatusColor } from '@/utils/adminUtils';
import type { Ticket } from '@/types/admin';

interface TicketBadgesProps {
  ticket: Ticket;
  hasNewMessages: boolean;
  messageCount: number;
  isAssignedToCurrentAdmin: boolean;
  isEscalated: boolean;
  isClosed: boolean;
}

const TicketBadges = ({
  ticket,
  hasNewMessages,
  messageCount,
  isAssignedToCurrentAdmin,
  isEscalated,
  isClosed
}: TicketBadgesProps) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
      {hasNewMessages && !isClosed && (
        <Badge variant="secondary" className="bg-red-100 text-red-800 flex items-center gap-1 text-xs">
          <Bell className="h-3 w-3" />
          {messageCount} New
        </Badge>
      )}
      <Badge className={getStatusColor(ticket.status)}>
        {ticket.status}
      </Badge>
      {isAssignedToCurrentAdmin && (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Assigned to You
        </Badge>
      )}
      {isEscalated && (
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          Escalated to Infosoft Dev
        </Badge>
      )}
    </div>
  );
};

export default TicketBadges;
