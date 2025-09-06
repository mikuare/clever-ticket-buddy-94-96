
import { Badge } from '@/components/ui/badge';
import { getStatusColor } from '@/utils/adminUtils';
import type { Ticket } from '@/types/admin';

interface TicketChatHeaderProps {
  ticket: Ticket;
}

const TicketChatHeader = ({ ticket }: TicketChatHeaderProps) => {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-lg font-semibold text-gray-900">
          Ticket Chat: {ticket.ticket_number}
        </h2>
        <Badge className={`${getStatusColor(ticket.status)} text-xs`}>
          {ticket.status}
        </Badge>
      </div>
      <div className="text-sm text-gray-600">
        <span className="font-medium">{ticket.title}</span> • 
        <span className="ml-1">{ticket.profiles?.full_name} ({ticket.profiles?.email})</span> • 
        <span className="ml-1">{ticket.department_code}</span>
      </div>
    </div>
  );
};

export default TicketChatHeader;
