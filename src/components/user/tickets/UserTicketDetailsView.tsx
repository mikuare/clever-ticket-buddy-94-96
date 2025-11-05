
import AttachmentDisplay from '@/components/shared/AttachmentDisplay';
import type { Ticket } from '@/hooks/useUserTickets';

interface UserTicketDetailsViewProps {
  ticket: Ticket;
  getStatusColor: (status: string) => string;
  getTicketMetadata: (ticket: Ticket) => {
    classification: string;
    categoryType: string;
    acumaticaModule: string;
  };
}

const UserTicketDetailsView = ({ 
  ticket, 
  getStatusColor, 
  getTicketMetadata 
}: UserTicketDetailsViewProps) => {
  const metadata = getTicketMetadata(ticket);

  return (
    <div className="space-y-4">
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 text-lg">{ticket.title}</h3>
      </div>
      
      <div 
        className="text-gray-700 mb-3 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: ticket.description }}
      />
      
      <div className="text-sm text-gray-500 space-y-2">
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium min-w-[80px]">Ticket ID:</span>
            <span>{ticket.ticket_number}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium min-w-[80px]">Classification:</span>
            <span>{metadata.classification}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium min-w-[80px]">Category:</span>
            <span>{metadata.categoryType}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium min-w-[80px]">Module:</span>
            <span>{metadata.acumaticaModule}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium min-w-[80px]">Created:</span>
            <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
          </div>
          {ticket.assigned_admin_name && (
            <div className="flex items-center gap-2">
              <span className="font-medium min-w-[80px]">Assigned to:</span>
              <span>{ticket.assigned_admin_name}</span>
            </div>
          )}
        </div>
      </div>

      <AttachmentDisplay attachments={ticket.attachments} />
    </div>
  );
};

export default UserTicketDetailsView;
