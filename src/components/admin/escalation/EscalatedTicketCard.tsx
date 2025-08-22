
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, User, Calendar } from 'lucide-react';
import ResolutionNotesDisplay from '../ticket-management/ResolutionNotesDisplay';
import ResolutionNoteDialog from '../ticket-management/ResolutionNoteDialog';
import type { EscalatedTicket } from './types';

interface EscalatedTicketCardProps {
  ticket: EscalatedTicket;
  canResolve: boolean;
  isResolving: boolean;
  onResolve: (escalationId: string, ticketNumber: string, resolutionNote: string) => void;
}

const EscalatedTicketCard = ({ ticket, canResolve, isResolving, onResolve }: EscalatedTicketCardProps) => {
  const [showResolutionDialog, setShowResolutionDialog] = useState(false);

  const handleResolveClick = () => {
    setShowResolutionDialog(true);
  };

  const handleResolutionSubmit = async (resolutionNote: string) => {
    await onResolve(ticket.escalation_id, ticket.ticket_number, resolutionNote);
    setShowResolutionDialog(false);
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{ticket.ticket_title}</h3>
          </div>
          <div 
            className="text-gray-600 text-sm mb-3 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: ticket.ticket_description }}
          />
        </div>
        
        {canResolve && (
          <Button
            size="sm"
            onClick={handleResolveClick}
            disabled={isResolving}
            className="ml-4 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            {isResolving ? 'Resolving...' : 'Mark as Resolved'}
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="font-medium">Ticket:</span>
            <span>{ticket.ticket_number}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="font-medium">Department:</span>
            <span>{ticket.ticket_department_code}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-4 h-4" />
            <span className="font-medium">User:</span>
            <span>{ticket.user_full_name}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="font-medium">Escalated by:</span>
            <span>{ticket.escalated_by_admin_name}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Escalated:</span>
            <span>{new Date(ticket.escalated_at).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Created:</span>
            <span>{new Date(ticket.ticket_created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      {ticket.escalation_reason && ticket.escalation_reason !== 'No specific reason provided' && (
        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
          <span className="font-medium text-orange-800">Escalation Reason:</span>
          <p className="text-orange-700 text-sm mt-1">{ticket.escalation_reason}</p>
        </div>
      )}
      
      <ResolutionNotesDisplay resolutionNotes={ticket.resolution_notes} />
      
      {!canResolve && (
        <div className="mt-3 text-xs text-gray-500 italic">
          Only {ticket.escalated_by_admin_name} can mark this escalation as resolved
        </div>
      )}

      <ResolutionNoteDialog
        isOpen={showResolutionDialog}
        onClose={() => setShowResolutionDialog(false)}
        onSubmit={handleResolutionSubmit}
        ticketNumber={ticket.ticket_number}
        isResolving={isResolving}
      />
    </div>
  );
};

export default EscalatedTicketCard;
