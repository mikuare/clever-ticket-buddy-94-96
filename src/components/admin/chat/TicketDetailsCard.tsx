
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AttachmentDisplay from '@/components/shared/AttachmentDisplay';
import EditTicketDetailsDialog from '@/components/admin/ticket-management/EditTicketDetailsDialog';
import type { Ticket } from '@/types/admin';

interface TicketDetailsCardProps {
  ticket: Ticket;
  onTicketUpdated?: () => void;
}

const TicketDetailsCard = ({ ticket, onTicketUpdated }: TicketDetailsCardProps) => {
  const { isAdmin, user } = useAdminAuth();
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Check if current admin can edit this ticket
  const canEditTicket = () => {
    if (!isAdmin || !user) return false;
    
    // Can edit if ticket is assigned to current admin and status is Open or In Progress
    const isAssignedToCurrentAdmin = ticket.assigned_admin_id === user.id;
    const isEditableStatus = ticket.status === 'Open' || ticket.status === 'In Progress';
    
    return isAssignedToCurrentAdmin && isEditableStatus;
  };

  const getTicketMetadata = () => {
    const attachments = ticket.attachments;
    let classification = 'General';
    let categoryType = 'Default';
    let acumaticaModule = 'General';

    if (attachments && typeof attachments === 'object' && !Array.isArray(attachments)) {
      const attachmentObj = attachments as Record<string, any>;
      classification = attachmentObj.classification || 'General';
      categoryType = attachmentObj.categoryType || 'Default';
      acumaticaModule = attachmentObj.acumaticaModule || 'General';
    }

    return {
      classification,
      categoryType,
      acumaticaModule
    };
  };

  const metadata = getTicketMetadata();

  const handleTicketUpdated = () => {
    if (onTicketUpdated) {
      onTicketUpdated();
    }
  };

  return (
    <>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">{ticket.title}</h3>
          </div>
          {canEditTicket() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditDialog(true)}
              className="text-gray-500 hover:text-gray-700 p-1 h-auto ml-2"
              title="Edit ticket details"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div 
          className="text-sm text-gray-700 mb-3 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: ticket.description }}
        />
        
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
          <span>Ticket: {ticket.ticket_number}</span>
          <span>User: {ticket.profiles?.full_name}</span>
          <span>Department: {ticket.department_code}</span>
          <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
          {ticket.assigned_admin_name && (
            <span>Assigned to: {ticket.assigned_admin_name}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded">
          <div className="flex items-center gap-1">
            <span className="font-medium">Classification:</span>
            <span>{metadata.classification}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Category:</span>
            <span>{metadata.categoryType}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Module:</span>
            <span>{metadata.acumaticaModule}</span>
          </div>
        </div>

        <AttachmentDisplay attachments={ticket.attachments} />
      </div>

      <EditTicketDetailsDialog
        ticket={ticket}
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onTicketUpdated={handleTicketUpdated}
      />
    </>
  );
};

export default TicketDetailsCard;
