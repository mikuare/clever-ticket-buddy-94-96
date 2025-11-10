
import { useState } from 'react';
import { useUserTickets } from '@/hooks/useUserTickets';
import { useUserNotifications } from '@/hooks/user/useUserNotifications';
import { useRealTimeUserPresence } from '@/hooks/useRealTimeUserPresence';
import { useAuth } from '@/hooks/useAuth';
import UserDashboardHeader from '@/components/user/UserDashboardHeader';
import UserDashboardContent from '@/components/user/UserDashboardContent';
import UserTicketChat from '@/components/UserTicketChat';
import AutoCloseService from '@/components/AutoCloseService';
import { AnimatedContainer } from '@/components/ui/animated-container';
import type { Ticket } from '@/hooks/useUserTickets';

const UserDashboard = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { profile } = useAuth();
  
  // Track user activity for presence (this will automatically handle real-time tracking)
  useRealTimeUserPresence();
  
  const {
    tickets,
    loading,
    classificationCooldowns,
    canCreateTicketForClassification,
    fetchTickets,
    handleTicketCreated
  } = useUserTickets();

  const { 
    ticketMessageCounts, 
    ticketStatusCounts,
    totalNotificationCount,
    clearNotificationForTicket,
    clearAllNotifications
  } = useUserNotifications(tickets);

  const handleViewTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    // Clear both message and status notifications when viewing ticket
    await clearNotificationForTicket(ticket.id);
  };

  const handleCloseTicketChat = () => {
    setSelectedTicket(null);
  };

  return (
    <AnimatedContainer variant="page" className="min-h-screen bg-background">
      <AutoCloseService />
      <UserDashboardHeader 
        onClearNotifications={clearAllNotifications}
        hasNotifications={totalNotificationCount > 0}
      />
      
      <AnimatedContainer variant="content">
        <UserDashboardContent 
          tickets={tickets}
          classificationCooldowns={classificationCooldowns}
          canCreateTicketForClassification={canCreateTicketForClassification}
          onTicketCreated={handleTicketCreated}
          onViewTicket={handleViewTicket}
          onTicketsUpdate={fetchTickets}
          ticketMessageCounts={ticketMessageCounts}
        />
      </AnimatedContainer>

      {selectedTicket && (
        <UserTicketChat
          ticket={selectedTicket}
          isOpen={true}
          onClose={handleCloseTicketChat}
          hasNewMessage={ticketMessageCounts.has(selectedTicket.id)}
          onMessagesViewed={clearNotificationForTicket}
        />
      )}
    </AnimatedContainer>
  );
};

export default UserDashboard;
