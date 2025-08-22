
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import TicketFilters from './tickets/TicketFilters';
import UserTicketCard from './tickets/UserTicketCard';
import MobileTicketCard from './tickets/MobileTicketCard';
import { useTicketAutoCloseManager } from './tickets/TicketAutoCloseManager';
import { useTicketReopenActions } from './tickets/useTicketReopenActions';
import { getTicketMetadata, getStatusColor } from './tickets/TicketMetadataUtils';
import { formatTimeRemaining } from './tickets/TicketTimerUtils';
import { calculateStatusCounts, filterTicketsByStatus } from './tickets/TicketStatusCounts';
import { TicketListEmpty } from './tickets/TicketListEmpty';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Ticket } from '@/hooks/useUserTickets';

interface UserTicketsListProps {
  tickets: Ticket[];
  onViewTicket: (ticket: Ticket) => void;
  onTicketsUpdate: () => void;
  ticketMessageCounts: Map<string, number>;
}

const UserTicketsList = ({ 
  tickets, 
  onViewTicket, 
  onTicketsUpdate,
  ticketMessageCounts 
}: UserTicketsListProps) => {
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved' | 'closed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const isMobile = useIsMobile();
  
  const { autoCloseTimers, handleCloseTicket } = useTicketAutoCloseManager({
    tickets,
    onTicketsUpdate
  });

  const { reopeningTickets, handleReopenTicket } = useTicketReopenActions(onTicketsUpdate);

  // Set up real-time subscription for ticket updates
  useEffect(() => {
    const channel = supabase
      .channel('user-tickets')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets'
        },
        (payload) => {
          console.log('Ticket updated:', payload);
          onTicketsUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onTicketsUpdate]);

  // Apply date range filter first
  const dateFilteredTickets = (startDate || endDate) ? tickets.filter(ticket => {
    const ticketDate = new Date(ticket.created_at);
    const ticketDateOnly = new Date(ticketDate.getFullYear(), ticketDate.getMonth(), ticketDate.getDate());
    
    if (startDate && endDate) {
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      return ticketDateOnly >= start && ticketDateOnly <= end;
    } else if (startDate) {
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      return ticketDateOnly >= start;
    } else if (endDate) {
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      return ticketDateOnly <= end;
    }
    return true;
  }) : tickets;

  // Apply search filter 
  const searchFilteredTickets = searchTerm.trim() ? dateFilteredTickets.filter(ticket => {
    try {
      const searchLower = searchTerm.toLowerCase().trim();
      
      // Search in ticket number and description
      const ticketNumber = (ticket.ticket_number || '').toLowerCase();
      const description = (ticket.description || '').toLowerCase();
      
      if (ticketNumber.includes(searchLower) || description.includes(searchLower)) {
        return true;
      }
      
      // Search in attachments (classification, category, module)
      const attachments = ticket.attachments as any;
      if (attachments && typeof attachments === 'object') {
        const classification = (attachments.classification || '').toLowerCase();
        const categoryType = (attachments.categoryType || '').toLowerCase();
        const acumaticaModule = (attachments.acumaticaModule || '').toLowerCase();
        
        return classification.includes(searchLower) || 
               categoryType.includes(searchLower) || 
               acumaticaModule.includes(searchLower);
      }
      return false;
    } catch (error) {
      return false;
    }
  }) : dateFilteredTickets;

  const filteredTickets = filterTicketsByStatus(searchFilteredTickets, filter);
  const statusCounts = calculateStatusCounts(searchFilteredTickets);

  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5" />
          <h2 className="text-lg font-semibold text-foreground">My Tickets ({tickets.length})</h2>
        </div>
        
        <TicketFilters 
          filter={filter}
          onFilterChange={setFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusCounts={statusCounts}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClearDateFilter={clearDateFilter}
        />

        {filteredTickets.length === 0 ? (
          <TicketListEmpty />
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => {
              const hasNewMessages = ticketMessageCounts.has(ticket.id);
              const canClose = ticket.status === 'Resolved' && ticket.admin_resolved_at && !ticket.user_closed_at;
              const canReopen = ticket.status === 'Resolved' && !ticket.user_closed_at;
              const timeRemaining = autoCloseTimers.get(ticket.id) || 0;
              const isReopening = reopeningTickets.has(ticket.id);
              
              return (
                <MobileTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  hasNewMessages={hasNewMessages}
                  canClose={canClose}
                  canReopen={canReopen}
                  timeRemaining={timeRemaining}
                  isClosing={false}
                  isReopening={isReopening}
                  onViewTicket={onViewTicket}
                  onCloseTicket={handleCloseTicket}
                  onReopenTicket={handleReopenTicket}
                  getStatusColor={getStatusColor}
                  getTicketMetadata={getTicketMetadata}
                  formatTimeRemaining={formatTimeRemaining}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          My Tickets ({tickets.length})
        </CardTitle>
        <CardDescription>
          View and manage your support tickets
        </CardDescription>
        
        <TicketFilters 
          filter={filter}
          onFilterChange={setFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusCounts={statusCounts}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClearDateFilter={clearDateFilter}
        />
      </CardHeader>
      
      <CardContent>
        {filteredTickets.length === 0 ? (
          <TicketListEmpty />
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => {
              const hasNewMessages = ticketMessageCounts.has(ticket.id);
              const canClose = ticket.status === 'Resolved' && ticket.admin_resolved_at && !ticket.user_closed_at;
              const canReopen = ticket.status === 'Resolved' && !ticket.user_closed_at;
              const timeRemaining = autoCloseTimers.get(ticket.id) || 0;
              const isReopening = reopeningTickets.has(ticket.id);
              
              return (
                <UserTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  hasNewMessages={hasNewMessages}
                  canClose={canClose}
                  canReopen={canReopen}
                  timeRemaining={timeRemaining}
                  isClosing={false}
                  isReopening={isReopening}
                  onViewTicket={onViewTicket}
                  onCloseTicket={handleCloseTicket}
                  onReopenTicket={handleReopenTicket}
                  getStatusColor={getStatusColor}
                  getTicketMetadata={getTicketMetadata}
                  formatTimeRemaining={formatTimeRemaining}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserTicketsList;
