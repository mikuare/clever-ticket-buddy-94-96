
import { useState } from 'react';
import TicketPagination from './ticket-management/TicketPagination';
import TicketReferralModal from './TicketReferralModal';
import TicketListHeader from './ticket-management/TicketListHeader';
import TicketList from './ticket-management/TicketList';
import type { Ticket } from '@/types/admin';

interface TicketManagementProps {
  tickets: Ticket[];
  selectedDepartment: string;
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onGoToPage: (page: number) => void;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
  loading: boolean;
  showAllTickets: boolean;
  onToggleShowAll: (showAll: boolean) => void;
  onAssignTicket: (ticketId: string) => void;
  onResolveTicket: (ticketId: string, ticketNumber: string, resolutionNote: string) => Promise<void>;
  onOpenChat: (ticket: Ticket) => void;
  ticketMessageCounts: Map<string, number>;
  currentAdminId: string;
  onTicketsUpdate: () => void;
  resolvingTickets: Set<string>;
  canReferTicket: (ticketId: string) => boolean;
  canEscalateTicket: (ticket: Ticket) => boolean;
  onEscalateTicket: (ticket: Ticket) => void;
  clearNotificationForTicket?: (ticketId: string) => void;
  // Bookmark functionality
  isBookmarked?: (ticketId: string) => boolean;
  getBookmarkInfo?: (ticketId: string) => { bookmark_title: string; created_at: string } | undefined;
  onBookmark?: (ticketId: string, title: string) => Promise<boolean>;
  onRemoveBookmark?: (ticketId: string) => Promise<boolean>;
}

const TicketManagement = ({
  tickets,
  selectedDepartment,
  totalCount,
  hasMore,
  currentPage,
  totalPages,
  pageSize,
  onGoToPage,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  loading,
  showAllTickets,
  onToggleShowAll,
  onAssignTicket,
  onResolveTicket,
  onOpenChat,
  ticketMessageCounts,
  currentAdminId,
  onTicketsUpdate,
  resolvingTickets,
  canReferTicket,
  canEscalateTicket,
  onEscalateTicket,
  clearNotificationForTicket,
  isBookmarked,
  getBookmarkInfo,
  onBookmark,
  onRemoveBookmark
}: TicketManagementProps) => {
  const [referralTicket, setReferralTicket] = useState<Ticket | null>(null);

  const handleReferTicket = (ticket: Ticket) => {
    setReferralTicket(ticket);
  };

  return (
    <div className="space-y-4">
      <TicketListHeader 
        selectedDepartment={selectedDepartment}
        ticketCount={tickets.length}
        totalCount={totalCount}
      />

      <TicketPagination
        pageItemCount={tickets.length}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onGoToPage={onGoToPage}
        hasMore={hasMore}
        loading={loading}
        onFirstPage={onFirstPage}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
        onLastPage={onLastPage}
        showAllTickets={showAllTickets}
        onToggleShowAll={onToggleShowAll}
      />

      <TicketList
        tickets={tickets}
        ticketMessageCounts={ticketMessageCounts}
        currentAdminId={currentAdminId}
        resolvingTickets={resolvingTickets}
        canReferTicket={canReferTicket}
        canEscalateTicket={canEscalateTicket}
        onOpenChat={onOpenChat}
        onResolveTicket={async (ticketId, resolutionNote) => {
          const ticket = tickets.find(t => t.id === ticketId);
          if (ticket) await onResolveTicket(ticketId, ticket.ticket_number, resolutionNote);
        }}
        onReferTicket={handleReferTicket}
        onAssignTicket={onAssignTicket}
        onEscalateTicket={onEscalateTicket}
        onTicketsUpdate={onTicketsUpdate}
        clearNotificationForTicket={clearNotificationForTicket}
        isBookmarked={isBookmarked}
        getBookmarkInfo={getBookmarkInfo}
        onBookmark={onBookmark}
        onRemoveBookmark={onRemoveBookmark}
      />

      {referralTicket && (
        <TicketReferralModal
          ticket={referralTicket}
          isOpen={!!referralTicket}
          onClose={() => setReferralTicket(null)}
          currentAdminId={currentAdminId}
          onReferralSent={() => {
            setReferralTicket(null);
            onTicketsUpdate();
          }}
        />
      )}
    </div>
  );
};

export default TicketManagement;
