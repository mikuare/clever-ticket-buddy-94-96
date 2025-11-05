import TicketCard from './TicketCard';
import type { Ticket } from '@/types/admin';

interface TicketCardViewProps {
  tickets: Ticket[];
  ticketMessageCounts: Map<string, number>;
  currentAdminId: string;
  resolvingTickets: Set<string>;
  canReferTicket: (ticketId: string) => boolean;
  canEscalateTicket: (ticket: Ticket) => boolean;
  onOpenChat: (ticket: Ticket) => void;
  onResolveTicket: (ticketId: string, resolutionNote: string) => Promise<void>;
  onReferTicket: (ticket: Ticket) => void;
  onAssignTicket: (ticketId: string) => void;
  onEscalateTicket: (ticket: Ticket) => void;
  onTicketsUpdate?: () => void;
  clearNotificationForTicket?: (ticketId: string) => void;
  isBookmarked?: (ticketId: string) => boolean;
  getBookmarkInfo?: (ticketId: string) => { bookmark_title: string; created_at: string } | undefined;
  onBookmark?: (ticketId: string, title: string) => Promise<boolean>;
  onRemoveBookmark?: (ticketId: string) => Promise<boolean>;
}

const TicketCardView = ({
  tickets,
  ticketMessageCounts,
  currentAdminId,
  resolvingTickets,
  canReferTicket,
  canEscalateTicket,
  onOpenChat,
  onResolveTicket,
  onReferTicket,
  onAssignTicket,
  onEscalateTicket,
  onTicketsUpdate,
  clearNotificationForTicket,
  isBookmarked,
  getBookmarkInfo,
  onBookmark,
  onRemoveBookmark
}: TicketCardViewProps) => {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tickets found matching the current filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => {
        const hasNewMessages = ticketMessageCounts.has(ticket.id);
        const messageCount = ticketMessageCounts.get(ticket.id) || 0;
        const isAssignedToCurrentAdmin = ticket.assigned_admin_id === currentAdminId;
        const canAssign = !ticket.assigned_admin_id && ticket.status === 'Open';
        const canResolve = isAssignedToCurrentAdmin && ticket.status === 'In Progress';
        const canRefer = canReferTicket(ticket.id);
        const canEscalate = canEscalateTicket(ticket);
        const isResolving = resolvingTickets.has(ticket.id);
        const isClosed = ticket.status === 'Closed';

        return (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            hasNewMessages={hasNewMessages}
            messageCount={messageCount}
            isAssignedToCurrentAdmin={isAssignedToCurrentAdmin}
            canAssign={canAssign}
            canResolve={canResolve}
            canRefer={canRefer}
            canEscalate={canEscalate}
            isResolving={isResolving}
            isClosed={isClosed}
            onViewDetails={onOpenChat}
            onResolveTicket={onResolveTicket}
            onReferTicket={onReferTicket}
            onAssignTicket={onAssignTicket}
            onEscalateTicket={onEscalateTicket}
            onTicketsUpdate={onTicketsUpdate}
            clearNotificationForTicket={clearNotificationForTicket}
            isBookmarked={isBookmarked ? isBookmarked(ticket.id) : false}
            bookmarkInfo={getBookmarkInfo ? getBookmarkInfo(ticket.id) : undefined}
            onBookmark={onBookmark}
            onRemoveBookmark={onRemoveBookmark}
          />
        );
      })}
    </div>
  );
};

export default TicketCardView;

