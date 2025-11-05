
import { useState } from 'react';
import TicketProgressionModal from '@/components/TicketProgressionModal';
import TicketDetailsModal from './TicketDetailsModal';
import TicketBadges from './components/TicketBadges';
import TicketInfo from './components/TicketInfo';
import TicketAttachments from './components/TicketAttachments';
import TicketActions from './components/TicketActions';
import ResolutionNotesDisplay from './ResolutionNotesDisplay';
import { useTicketEscalation } from './hooks/useTicketEscalation';
import { useEscalateButtonDelay } from './hooks/useEscalateButtonDelay';
import type { Ticket } from '@/types/admin';

interface TicketCardProps {
  ticket: Ticket;
  hasNewMessages: boolean;
  messageCount: number;
  isAssignedToCurrentAdmin: boolean;
  canAssign: boolean;
  canResolve: boolean;
  canRefer: boolean;
  canEscalate: boolean;
  isResolving: boolean;
  isClosed: boolean;
  onViewDetails: (ticket: Ticket) => void;
  onResolveTicket: (ticketId: string, resolutionNote: string) => Promise<void>;
  onReferTicket: (ticket: Ticket) => void;
  onAssignTicket: (ticketId: string) => void;
  onEscalateTicket: (ticket: Ticket) => void;
  onTicketsUpdate?: () => void;
  clearNotificationForTicket?: (ticketId: string) => void;
  // Bookmark functionality
  isBookmarked?: boolean;
  bookmarkInfo?: {
    bookmark_title: string;
    created_at: string;
  };
  onBookmark?: (ticketId: string, title: string) => Promise<boolean>;
  onRemoveBookmark?: (ticketId: string) => Promise<boolean>;
}

const TicketCard = ({
  ticket,
  hasNewMessages,
  messageCount,
  isAssignedToCurrentAdmin,
  canAssign,
  canResolve,
  canRefer,
  canEscalate,
  isResolving,
  isClosed,
  onViewDetails,
  onResolveTicket,
  onReferTicket,
  onAssignTicket,
  onEscalateTicket,
  onTicketsUpdate,
  clearNotificationForTicket,
  isBookmarked,
  bookmarkInfo,
  onBookmark,
  onRemoveBookmark
}: TicketCardProps) => {
  const [showProgression, setShowProgression] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const { isEscalated } = useTicketEscalation(ticket.id);
  const { showEscalateButton } = useEscalateButtonDelay(canEscalate);

  const handleViewDetails = async () => {
    // Clear notification when viewing details
    if (clearNotificationForTicket && hasNewMessages) {
      console.log('Clearing notification for ticket:', ticket.ticket_number);
      await clearNotificationForTicket(ticket.id);
    }
    setShowDetailsModal(true);
  };

  const handleOpenChat = (ticket: Ticket) => {
    onViewDetails(ticket);
  };

  // Don't show refer button if ticket is escalated to Infosoft Dev
  const shouldShowReferButton = canRefer && !isEscalated;

  return (
    <>
      <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <TicketBadges
              ticket={ticket}
              hasNewMessages={hasNewMessages}
              messageCount={messageCount}
              isAssignedToCurrentAdmin={isAssignedToCurrentAdmin}
              isEscalated={isEscalated}
              isClosed={isClosed}
            />
            
            <TicketInfo ticket={ticket} isClosed={isClosed} />
            
            <TicketAttachments attachments={ticket.attachments} />
            
            <ResolutionNotesDisplay resolutionNotes={ticket.resolution_notes} />
          </div>
          
          <TicketActions
            ticket={ticket}
            hasNewMessages={hasNewMessages}
            messageCount={messageCount}
            canAssign={canAssign}
            canResolve={canResolve}
            shouldShowReferButton={shouldShowReferButton}
            canEscalate={canEscalate}
            isResolving={isResolving}
            isClosed={isClosed}
            showEscalateButton={showEscalateButton}
            isEscalated={isEscalated}
            onShowProgression={() => setShowProgression(true)}
            onViewDetails={handleViewDetails}
            onResolveTicket={async (ticketId, ticketNumber, resolutionNote) => 
              await onResolveTicket(ticketId, resolutionNote)
            }
            onReferTicket={onReferTicket}
            onAssignTicket={onAssignTicket}
            onEscalateTicket={onEscalateTicket}
            isBookmarked={isBookmarked}
            bookmarkInfo={bookmarkInfo}
            onBookmark={onBookmark}
            onRemoveBookmark={onRemoveBookmark}
          />
        </div>
      </div>

      <TicketProgressionModal
        ticket={ticket}
        isOpen={showProgression}
        onClose={() => setShowProgression(false)}
      />

      <TicketDetailsModal
        ticket={ticket}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onOpenChat={handleOpenChat}
        onTicketUpdated={onTicketsUpdate}
      />
    </>
  );
};

export default TicketCard;
