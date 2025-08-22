
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useTicketsManagement } from '@/hooks/useTicketsManagement';
import { useDepartmentsManagement } from '@/hooks/useDepartmentsManagement';
import { useAdminDashboardViews } from '@/components/admin/hooks/useAdminDashboardViews';
import { useAdminNotifications } from './admin/useAdminNotifications';
import { useAdminActions } from './admin/useAdminActions';
import { useAdminBookmarks } from '@/hooks/useAdminBookmarks';

export const useAdminDashboard = () => {
  const { signOut } = useAuth();
  const { isAdmin, isVerifyingAdmin, profile } = useAdminAuth();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Core data management
  const { tickets, stats, loading, fetchTickets } = useTicketsManagement(isAdmin, isVerifyingAdmin);
  const { departments } = useDepartmentsManagement(isAdmin, isVerifyingAdmin);

  // Notifications management
  const {
    departmentNotifications,
    userNotifications,
    ticketMessageCounts,
    clearNotificationForTicket,
    referralCount
  } = useAdminNotifications(tickets, departments, isAdmin, profile);

  // Actions management
  const {
    selectedTicket,
    resolvingTickets,
    canReferTicket,
    canEscalateTicket,
    enableReferralsForAssignedTickets,
    handleAssignTicket,
    handleResolveTicket,
    handleOpenTicketChat,
    handleCloseTicketChat,
    selectedTicketForEscalation,
    showEscalatedTickets,
    handleOpenEscalationModal,
    handleCloseEscalationModal,
    handleEscalationSuccess,
    handleOpenEscalatedTickets,
    handleCloseEscalatedTickets,
    handleTicketResolved
  } = useAdminActions(profile, fetchTickets);

  // View state management
  const {
    showUserPresence,
    showDepartmentUsers,
    showDepartmentImages,
    showAdminAnalysis,
    showTicketAnalysis,
    showBookmarks,
    handleViewUsers,
    handleViewDepartmentUsers,
    handleViewDepartmentImages,
    handleViewAdminAnalysis,
    handleViewTicketAnalysis,
    handleViewBookmarks,
    closeAllViews
  } = useAdminDashboardViews();

  // Bookmark functionality
  const bookmarks = useAdminBookmarks(profile?.id || '');

  // Enable referrals for tickets assigned to current admin when tickets are loaded
  useEffect(() => {
    if (tickets.length > 0 && profile?.id && enableReferralsForAssignedTickets) {
      enableReferralsForAssignedTickets(tickets);
    }
  }, [tickets, profile?.id, enableReferralsForAssignedTickets]);

  // Enhanced handleOpenTicketChat to clear notification and track open time
  const handleOpenTicketChatWithNotificationClear = (ticket: any) => {
    console.log('Opening admin ticket chat and clearing notifications for:', ticket.ticket_number);
    clearNotificationForTicket(ticket.id);
    handleOpenTicketChat(ticket);
  };

  return {
    // State
    tickets,
    stats,
    departments,
    selectedDepartment,
    selectedTicket,
    loading,
    departmentNotifications,
    userNotifications,
    ticketMessageCounts,
    resolvingTickets,
    canReferTicket,
    canEscalateTicket,
    
    // Escalation state
    selectedTicketForEscalation,
    showEscalatedTickets,
    
    // View states
    showUserPresence,
    showDepartmentUsers,
    showDepartmentImages,
    showAdminAnalysis,
    showTicketAnalysis,
    showBookmarks,
    
    // Auth state
    isAdmin,
    isVerifyingAdmin,
    profile,
    signOut,
    
    // Actions
    setSelectedDepartment,
    handleAssignTicket,
    handleResolveTicket,
    handleOpenTicketChat: handleOpenTicketChatWithNotificationClear,
    handleCloseTicketChat,
    fetchTickets,
    clearNotificationForTicket,
    
    // Escalation actions
    handleOpenEscalationModal,
    handleCloseEscalationModal,
    handleEscalationSuccess,
    handleOpenEscalatedTickets,
    handleCloseEscalatedTickets,
    handleTicketResolved,
    
    // View actions
    handleViewUsers,
    handleViewDepartmentUsers,
    handleViewDepartmentImages,
    handleViewAdminAnalysis,
    handleViewTicketAnalysis,
    handleViewBookmarks,
    closeAllViews,
    
    // Referral notifications
    referralCount,
    
    // Bookmark functionality
    ...bookmarks
  };
};
