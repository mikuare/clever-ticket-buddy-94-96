
import type { Ticket } from '@/types/admin';

interface TicketInfoProps {
  ticket: Ticket;
  isClosed: boolean;
}

const TicketInfo = ({ ticket, isClosed }: TicketInfoProps) => {
  return (
    <>
      <div 
        className="text-gray-600 mb-2 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: ticket.description }}
      />
      <div className="text-sm text-gray-500">
        <span className="mr-4">ID: {ticket.ticket_number}</span>
        <span className="mr-4">Department: {ticket.department_code}</span>
        <span className="mr-4">User: {ticket.profiles?.full_name || 'Unknown'}</span>
        <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
        {ticket.isReopened && (
          <span className="ml-4 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
            REOPENED
          </span>
        )}
        {ticket.assigned_admin_name && (
          <span className="ml-4">Assigned to: {ticket.assigned_admin_name}</span>
        )}
        {isClosed && ticket.user_closed_at && (
          <span className="ml-4">Closed: {new Date(ticket.user_closed_at).toLocaleDateString()}</span>
        )}
      </div>
    </>
  );
};

export default TicketInfo;
