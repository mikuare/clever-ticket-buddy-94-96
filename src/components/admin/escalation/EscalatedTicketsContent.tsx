
import { Zap } from 'lucide-react';
import EscalatedTicketCard from './EscalatedTicketCard';
import type { EscalatedTicket } from './types';

interface EscalatedTicketsContentProps {
  loading: boolean;
  escalatedTickets: EscalatedTicket[];
  resolvingTickets: Set<string>;
  userId?: string;
  onResolve: (escalationId: string, ticketNumber: string, resolutionNote: string) => void;
}

const EscalatedTicketsContent = ({ 
  loading, 
  escalatedTickets, 
  resolvingTickets, 
  userId, 
  onResolve 
}: EscalatedTicketsContentProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (escalatedTickets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No tickets currently escalated to Infosoft Dev</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {escalatedTickets.map((ticket) => {
        const canResolve = ticket.escalated_by_admin_id === userId;
        const isResolving = resolvingTickets.has(ticket.escalation_id);
        
        return (
          <EscalatedTicketCard
            key={ticket.escalation_id}
            ticket={ticket}
            canResolve={canResolve}
            isResolving={isResolving}
            onResolve={onResolve}
          />
        );
      })}
    </div>
  );
};

export default EscalatedTicketsContent;
