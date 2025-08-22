import { useMemo } from 'react';
import { useUserMessageNotifications } from '@/hooks/useUserMessageNotifications';
import { useUserTicketStatusNotifications } from '@/hooks/user/useUserTicketStatusNotifications';
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications';
import type { Ticket } from '@/hooks/useUserTickets';

export const useUserNotifications = (tickets: Ticket[]) => {
  // Get message notifications
  const { ticketMessageCounts, clearNotificationForTicket } = useUserMessageNotifications(tickets);
  
  // Get ticket status change notifications
  const { ticketStatusCounts } = useUserTicketStatusNotifications(tickets);
  
  // Calculate total notification count
  const totalNotificationCount = useMemo(() => {
    const messageCount = Array.from(ticketMessageCounts.values()).reduce((sum, count) => sum + count, 0);
    const statusCount = Array.from(ticketStatusCounts.values()).reduce((sum, count) => sum + count, 0);
    return messageCount + statusCount;
  }, [ticketMessageCounts, ticketStatusCounts]);

  // Initialize browser notifications for users
  const { playNotificationSound } = useBrowserNotifications({
    isEnabled: true, // Always enabled for users
    notificationCount: totalNotificationCount,
    title: 'Helpdesk User'
  });

  return {
    ticketMessageCounts,
    ticketStatusCounts,
    totalNotificationCount,
    clearNotificationForTicket,
    playNotificationSound
  };
};