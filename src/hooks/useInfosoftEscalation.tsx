
import { useState, useCallback } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import type { Ticket } from '@/types/admin';

export const useInfosoftEscalation = (fetchTickets: () => void) => {
  const { user } = useAdminAuth();
  const [selectedTicketForEscalation, setSelectedTicketForEscalation] = useState<Ticket | null>(null);
  const [showEscalatedTickets, setShowEscalatedTickets] = useState(false);

  const canEscalateTicket = useCallback((ticket: Ticket) => {
    return (
      ticket.assigned_admin_id === user?.id &&
      ticket.status === 'In Progress'
    );
  }, [user?.id]);

  const handleOpenEscalationModal = useCallback((ticket: Ticket) => {
    setSelectedTicketForEscalation(ticket);
  }, []);

  const handleCloseEscalationModal = useCallback(() => {
    setSelectedTicketForEscalation(null);
  }, []);

  const handleEscalationSuccess = useCallback(() => {
    fetchTickets();
    setSelectedTicketForEscalation(null);
  }, [fetchTickets]);

  const handleOpenEscalatedTickets = useCallback(() => {
    setShowEscalatedTickets(true);
  }, []);

  const handleCloseEscalatedTickets = useCallback(() => {
    setShowEscalatedTickets(false);
  }, []);

  const handleTicketResolved = useCallback(() => {
    fetchTickets();
  }, [fetchTickets]);

  return {
    selectedTicketForEscalation,
    showEscalatedTickets,
    canEscalateTicket,
    handleOpenEscalationModal,
    handleCloseEscalationModal,
    handleEscalationSuccess,
    handleOpenEscalatedTickets,
    handleCloseEscalatedTickets,
    handleTicketResolved
  };
};
