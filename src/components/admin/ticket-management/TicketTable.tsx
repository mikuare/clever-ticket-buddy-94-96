import { useState } from 'react';
import { Eye, Bell, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getStatusColor } from '@/utils/adminUtils';
import TicketCard from './TicketCard';
import { useTicketEscalation } from './hooks/useTicketEscalation';
import type { Ticket } from '@/types/admin';

interface TicketTableProps {
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

const TicketTableRow = ({ 
  ticket, 
  hasNewMessages,
  messageCount,
  isExpanded,
  onToggleExpand,
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
  bookmarkInfo,
  onBookmark,
  onRemoveBookmark
}: { 
  ticket: Ticket; 
  hasNewMessages: boolean;
  messageCount: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
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
  isBookmarked: boolean;
  bookmarkInfo?: { bookmark_title: string; created_at: string };
  onBookmark?: (ticketId: string, title: string) => Promise<boolean>;
  onRemoveBookmark?: (ticketId: string) => Promise<boolean>;
}) => {
  const metadata = getTicketMetadata(ticket);
  const { isEscalated } = useTicketEscalation(ticket.id);
  
  return (
    <>
      <tr 
        className={`border-b hover:bg-muted/50 transition-colors cursor-pointer ${isExpanded ? 'bg-muted/30' : ''}`}
        onClick={onToggleExpand}
      >
        <td className="px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            {ticket.ticket_number}
            {hasNewMessages && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 flex items-center gap-1 text-xs">
                <Bell className="h-3 w-3" />
                {messageCount}
              </Badge>
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-sm">
          {new Date(ticket.created_at).toLocaleDateString()}
        </td>
        <td className="px-4 py-3 text-sm">{metadata.classification}</td>
        <td className="px-4 py-3 text-sm">{metadata.categoryType}</td>
        <td className="px-4 py-3 text-sm">{metadata.acumaticaModule}</td>
        <td className="px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(ticket.status)}>
              {ticket.status}
            </Badge>
            {isEscalated && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                Escalated
              </Badge>
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-sm">
          {ticket.assigned_admin_name || 'Unassigned'}
        </td>
        <td className="px-4 py-3 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={8} className="p-0">
            <div className="bg-muted/20 border-t-2 border-primary/20 animate-in slide-in-from-top-2 duration-300">
              <div className="p-6">
                <TicketCard
                  ticket={ticket}
                  hasNewMessages={hasNewMessages}
                  messageCount={messageCount}
                  isAssignedToCurrentAdmin={ticket.assigned_admin_id === currentAdminId}
                  canAssign={!ticket.assigned_admin_id && ticket.status === 'Open'}
                  canResolve={ticket.assigned_admin_id === currentAdminId && ticket.status === 'In Progress'}
                  canRefer={canReferTicket(ticket.id)}
                  canEscalate={canEscalateTicket(ticket)}
                  isResolving={resolvingTickets.has(ticket.id)}
                  isClosed={ticket.status === 'Closed'}
                  onViewDetails={onOpenChat}
                  onResolveTicket={onResolveTicket}
                  onReferTicket={onReferTicket}
                  onAssignTicket={onAssignTicket}
                  onEscalateTicket={onEscalateTicket}
                  onTicketsUpdate={onTicketsUpdate}
                  clearNotificationForTicket={clearNotificationForTicket}
                  isBookmarked={isBookmarked}
                  bookmarkInfo={bookmarkInfo}
                  onBookmark={onBookmark}
                  onRemoveBookmark={onRemoveBookmark}
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const TicketTable = ({
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
}: TicketTableProps) => {
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tickets found matching the current filters.
      </div>
    );
  }

  const handleToggleExpand = async (ticketId: string) => {
    const hasNewMessages = ticketMessageCounts.has(ticketId);
    
    // Clear notification when expanding ticket details
    if (clearNotificationForTicket && hasNewMessages && expandedTicketId !== ticketId) {
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        console.log('Clearing notification for ticket:', ticket.ticket_number);
        await clearNotificationForTicket(ticketId);
      }
    }
    
    // Toggle expanded state
    setExpandedTicketId(expandedTicketId === ticketId ? null : ticketId);
  };

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">Ticket ID</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Date Created</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Classification</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Module</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Assigned To</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => {
            const hasNewMessages = ticketMessageCounts.has(ticket.id);
            const messageCount = ticketMessageCounts.get(ticket.id) || 0;
            const isExpanded = expandedTicketId === ticket.id;

            return (
              <TicketTableRow
                key={ticket.id}
                ticket={ticket}
                hasNewMessages={hasNewMessages}
                messageCount={messageCount}
                isExpanded={isExpanded}
                onToggleExpand={() => handleToggleExpand(ticket.id)}
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
                isBookmarked={isBookmarked ? isBookmarked(ticket.id) : false}
                bookmarkInfo={getBookmarkInfo ? getBookmarkInfo(ticket.id) : undefined}
                onBookmark={onBookmark}
                onRemoveBookmark={onRemoveBookmark}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;

