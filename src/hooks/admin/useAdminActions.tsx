
import { useAdminTicketActions } from '@/hooks/useAdminTicketActions';
import { useInfosoftEscalation } from '@/hooks/useInfosoftEscalation';

export const useAdminActions = (profile: any, fetchTickets: () => void) => {
  const {
    selectedTicket,
    resolvingTickets,
    canReferTicket,
    canEscalateTicket,
    enableReferralsForAssignedTickets,
    handleAssignTicket,
    handleResolveTicket,
    handleOpenTicketChat,
    handleCloseTicketChat
  } = useAdminTicketActions(profile, fetchTickets);

  const {
    selectedTicketForEscalation,
    showEscalatedTickets,
    handleOpenEscalationModal,
    handleCloseEscalationModal,
    handleEscalationSuccess,
    handleOpenEscalatedTickets,
    handleCloseEscalatedTickets,
    handleTicketResolved
  } = useInfosoftEscalation(fetchTickets);

  return {
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
  };
};
