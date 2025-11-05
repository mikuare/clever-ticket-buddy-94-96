import { useMemo, useEffect } from 'react';
import { useUserMessageNotifications } from '@/hooks/useUserMessageNotifications';
import { useUserTicketStatusNotifications } from '@/hooks/user/useUserTicketStatusNotifications';
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications';
import { useWebNotifications } from '@/hooks/useWebNotifications';
import type { Ticket } from '@/hooks/useUserTickets';

export const useUserNotifications = (tickets: Ticket[]) => {
  const { requestPermission } = useWebNotifications();

  // Request notification permission on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Get message notifications
  const { ticketMessageCounts, clearNotificationForTicket: clearMessageNotifications } = useUserMessageNotifications(tickets);
  
  // Get ticket status change notifications
  const { ticketStatusCounts, clearStatusNotificationForTicket } = useUserTicketStatusNotifications(tickets);
  
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
    title: 'Helpdesk User',
    showWebNotification: true
  });

  // Combined clear function that clears both message and status notifications
  const clearNotificationForTicket = async (ticketId: string) => {
    await Promise.all([
      clearMessageNotifications(ticketId),
      clearStatusNotificationForTicket(ticketId)
    ]);
  };

  // Clear all notifications function
  const clearAllNotifications = async () => {
    if (!tickets || tickets.length === 0) return;
    
    try {
      // Clear notifications for all tickets
      await Promise.all(tickets.map(ticket => clearNotificationForTicket(ticket.id)));
    } catch (error) {
      console.error('Error clearing all user notifications:', error);
    }
  };

  return {
    ticketMessageCounts,
    ticketStatusCounts,
    totalNotificationCount,
    clearNotificationForTicket,
    clearAllNotifications,
    playNotificationSound
  };
};