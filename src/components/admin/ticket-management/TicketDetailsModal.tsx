import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, MessageSquare, Clock, User, Calendar, Building2 } from 'lucide-react';
import { getStatusColor } from '@/utils/adminUtils';
import { getAttachmentsArray } from '@/utils/attachmentUtils';
import AttachmentDisplay from '@/components/shared/AttachmentDisplay';
import TicketProgressionModal from '@/components/TicketProgressionModal';
import EditTicketDetailsDialog from './EditTicketDetailsDialog';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import type { Ticket } from '@/types/admin';

interface TicketDetailsModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: (ticket: Ticket) => void;
  onTicketUpdated?: () => void;
}

const TicketDetailsModal = ({ 
  ticket, 
  isOpen, 
  onClose, 
  onOpenChat,
  onTicketUpdated
}: TicketDetailsModalProps) => {
  const [showProgression, setShowProgression] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { isAdmin, user } = useAdminAuth();

  if (!ticket) return null;

  const attachments = getAttachmentsArray(ticket.attachments);

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

  const handleOpenChat = () => {
    onClose();
    onOpenChat(ticket);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="text-xl font-bold">Ticket Details</DialogTitle>
            <div className="flex items-center gap-2">
              {canEditTicket() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Edit ticket details"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
            </div>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[70vh] space-y-6">
            {/* Header Information */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{ticket.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {ticket.ticket_number}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Ticket Description */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <div 
                  className="text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: ticket.description }}
                />
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Submitted by:</span>
                    <span>{ticket.profiles?.full_name || 'Unknown User'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Department:</span>
                    <span>{ticket.department_code}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Created:</span>
                    <span>{new Date(ticket.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {ticket.assigned_admin_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Assigned to:</span>
                      <span>{ticket.assigned_admin_name}</span>
                    </div>
                  )}
                  
                  {ticket.resolved_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Resolved:</span>
                      <span>{new Date(ticket.resolved_at).toLocaleString()}</span>
                    </div>
                  )}
                  
                  {ticket.user_closed_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Closed:</span>
                      <span>{new Date(ticket.user_closed_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Classification Metadata */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Classification Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Classification:</span>
                    <div className="mt-1 text-gray-900">{metadata.classification}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Category:</span>
                    <div className="mt-1 text-gray-900">{metadata.categoryType}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Module:</span>
                    <div className="mt-1 text-gray-900">{metadata.acumaticaModule}</div>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              {attachments && attachments.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Attachments</h4>
                  <AttachmentDisplay attachments={ticket.attachments} />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 pb-2 border-t bg-background/95 backdrop-blur-sm sticky bottom-0 shadow-lg">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowProgression(true)}
                className="flex items-center gap-2 h-11 px-6 font-medium border-2 hover:bg-accent/80 transition-all duration-200"
              >
                <Clock className="w-4 h-4" />
                View Progression
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="h-11 px-6 font-medium border-2 hover:bg-accent/80 transition-all duration-200"
              >
                Close
              </Button>
              <Button 
                onClick={handleOpenChat} 
                className="flex items-center gap-2 h-11 px-6 font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all duration-200"
              >
                <MessageSquare className="w-4 h-4" />
                Open Chat
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-modals */}
      <TicketProgressionModal
        ticket={ticket}
        isOpen={showProgression}
        onClose={() => setShowProgression(false)}
      />

      <EditTicketDetailsDialog
        ticket={ticket}
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onTicketUpdated={handleTicketUpdated}
      />

    </>
  );
};

export default TicketDetailsModal;
