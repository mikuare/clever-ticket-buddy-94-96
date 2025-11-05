import type { Ticket } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import { useTicketDetailsChanged } from '@/hooks/useTicketDetailsChanged';
import { Edit3 } from 'lucide-react';

interface TicketInfoProps {
  ticket: Ticket;
  isClosed: boolean;
}

const getTicketMetadata = (ticket: Ticket) => {
  try {
    const attachments = ticket.attachments;
    if (attachments && typeof attachments === 'object' && !Array.isArray(attachments)) {
      const attachmentObj = attachments as Record<string, any>;
      return {
        classification: attachmentObj.classification || 'N/A',
        categoryType: attachmentObj.categoryType || 'N/A',
        acumaticaModule: attachmentObj.acumaticaModule || 'N/A'
      };
    }
  } catch (error) {
    console.log('Error parsing ticket metadata:', error);
  }
  return {
    classification: 'N/A',
    categoryType: 'N/A',
    acumaticaModule: 'N/A'
  };
};

const TicketInfo = ({ ticket, isClosed }: TicketInfoProps) => {
  const metadata = getTicketMetadata(ticket);
  const { hasDetailsChanged } = useTicketDetailsChanged(ticket.id);
  
  return (
    <>
      {/* Classification, Category, Module metadata badges */}
      <div className="flex flex-wrap gap-2 mb-2">
        <Badge variant="outline" className="text-xs">
          Classification: {metadata.classification}
        </Badge>
        <Badge variant="outline" className="text-xs">
          Category: {metadata.categoryType}
        </Badge>
        <Badge variant="outline" className="text-xs">
          Module: {metadata.acumaticaModule}
        </Badge>
        {hasDetailsChanged && (
          <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100">
            <Edit3 className="w-3 h-3 mr-1" />
            Details Updated
          </Badge>
        )}
      </div>
      
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
