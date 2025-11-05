import { useMemo, useEffect } from 'react';
import { useNotificationsManagement } from '@/hooks/useNotificationsManagement';
import { useAdminMessageNotifications } from '@/hooks/useAdminMessageNotifications';
import { useRealtimeEscalationNotifications } from '@/hooks/useRealtimeEscalationNotifications';
import { useRealtimeReferralNotifications } from '@/hooks/useRealtimeReferralNotifications';
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications';
import { useWebNotifications } from '@/hooks/useWebNotifications';
import type { Ticket, Department } from '@/types/admin';

export const useAdminNotifications = (
  tickets: Ticket[], 
  departments: Department[],
  isAdmin: boolean,
  profile: any
) => {
  const { requestPermission } = useWebNotifications();

  // Request notification permission on mount
  useEffect(() => {
    if (isAdmin) {
      requestPermission();
    }
  }, [isAdmin, requestPermission]);
  const { departmentNotifications, userNotifications } = useNotificationsManagement(tickets, departments);
  const { ticketMessageCounts, clearNotificationForTicket } = useAdminMessageNotifications(
    isAdmin,
    profile,
    tickets
  );
  
  // Real-time escalation and referral notifications
  const { escalationCount } = useRealtimeEscalationNotifications(isAdmin, profile);
  const { referralCount } = useRealtimeReferralNotifications(isAdmin, profile);

  // Calculate total notification count for browser tab
  const totalBrowserNotifications = useMemo(() => {
    if (!isAdmin || !profile?.id) return 0;
    
    // Count open tickets that need attention
    const openTicketsCount = departmentNotifications.reduce((total, dept) => total + dept.openTickets.length, 0);
    
    // Count unread messages for assigned tickets  
    const messageNotificationsCount = Array.from(ticketMessageCounts.values()).reduce((sum, count) => sum + count, 0);
    
    // Add only referral counts (excluding escalations from browser tab notifications)
    const totalCount = openTicketsCount + messageNotificationsCount + referralCount;
    
    console.log('Total browser notifications:', {
      openTickets: openTicketsCount,
      messages: messageNotificationsCount,
      referrals: referralCount,
      total: totalCount,
      escalations_excluded: escalationCount
    });
    
    return totalCount;
  }, [isAdmin, profile?.id, departmentNotifications, ticketMessageCounts, referralCount]);

  // Enable browser tab notifications for admins with enhanced real-time updates
  useBrowserNotifications({
    isEnabled: isAdmin && !!profile?.id,
    notificationCount: totalBrowserNotifications,
    title: 'Helpdesk Admin Dashboard',
    showWebNotification: true
  });

  // Clear all notifications function for admins
  const clearAllNotifications = async () => {
    if (!tickets || tickets.length === 0) return;
    
    try {
      // Clear notifications for all tickets that this admin is involved with
      const adminTickets = tickets.filter(ticket => 
        ticket.status === 'Open' || ticket.assigned_admin_id === profile?.id
      );
      
      await Promise.all(adminTickets.map(ticket => clearNotificationForTicket(ticket.id)));
    } catch (error) {
      console.error('Error clearing all admin notifications:', error);
    }
  };

  return {
    departmentNotifications,
    userNotifications,
    ticketMessageCounts,
    clearNotificationForTicket,
    clearAllNotifications,
    totalBrowserNotifications,
    escalationCount,
    referralCount
  };
};
