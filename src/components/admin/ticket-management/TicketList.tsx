
import { useState } from 'react';
import { Eye, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TicketTable from './TicketTable';
import TicketCardView from './TicketCardView';
import type { Ticket } from '@/types/admin';

interface TicketListProps {
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
  // Bookmark functionality
  isBookmarked?: (ticketId: string) => boolean;
  getBookmarkInfo?: (ticketId: string) => { bookmark_title: string; created_at: string } | undefined;
  onBookmark?: (ticketId: string, title: string) => Promise<boolean>;
  onRemoveBookmark?: (ticketId: string) => Promise<boolean>;
}

const TicketList = ({
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
}: TicketListProps) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border bg-muted p-1">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="gap-2"
          >
            <Table className="h-4 w-4" />
            Table View
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className="gap-2"
          >
            <Eye className="h-5 w-5" />
            Full Card View
          </Button>
        </div>
      </div>

      {/* Render based on view mode */}
      {viewMode === 'table' ? (
        <TicketTable
          tickets={tickets}
          ticketMessageCounts={ticketMessageCounts}
          currentAdminId={currentAdminId}
          resolvingTickets={resolvingTickets}
          canReferTicket={canReferTicket}
          canEscalateTicket={canEscalateTicket}
          onOpenChat={onOpenChat}
          onResolveTicket={onResolveTicket}
          onReferTicket={onReferTicket}
          onAssignTicket={onAssignTicket}
          onEscalateTicket={onEscalateTicket}
          onTicketsUpdate={onTicketsUpdate}
          clearNotificationForTicket={clearNotificationForTicket}
          isBookmarked={isBookmarked}
          getBookmarkInfo={getBookmarkInfo}
          onBookmark={onBookmark}
          onRemoveBookmark={onRemoveBookmark}
        />
      ) : (
        <TicketCardView
          tickets={tickets}
          ticketMessageCounts={ticketMessageCounts}
          currentAdminId={currentAdminId}
          resolvingTickets={resolvingTickets}
          canReferTicket={canReferTicket}
          canEscalateTicket={canEscalateTicket}
          onOpenChat={onOpenChat}
          onResolveTicket={onResolveTicket}
          onReferTicket={onReferTicket}
          onAssignTicket={onAssignTicket}
          onEscalateTicket={onEscalateTicket}
          onTicketsUpdate={onTicketsUpdate}
          clearNotificationForTicket={clearNotificationForTicket}
          isBookmarked={isBookmarked}
          getBookmarkInfo={getBookmarkInfo}
          onBookmark={onBookmark}
          onRemoveBookmark={onRemoveBookmark}
        />
      )}
    </div>
  );
};

export default TicketList;
