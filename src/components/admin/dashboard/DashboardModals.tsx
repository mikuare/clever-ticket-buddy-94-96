
import InfosoftEscalationModal from '../escalation/InfosoftEscalationModal';
import FloatingEscalatedTickets from '../escalation/FloatingEscalatedTickets';
import type { Ticket } from '@/types/admin';

interface DashboardModalsProps {
  selectedTicketForEscalation: Ticket | null;
  showEscalatedTickets: boolean;
  onCloseEscalationModal: () => void;
  onEscalationSuccess: () => void;
  onCloseEscalatedTickets: () => void;
  onTicketResolved: () => void;
}

const DashboardModals = ({
  selectedTicketForEscalation,
  showEscalatedTickets,
  onCloseEscalationModal,
  onEscalationSuccess,
  onCloseEscalatedTickets,
  onTicketResolved
}: DashboardModalsProps) => {
  return (
    <>
      {selectedTicketForEscalation && (
        <InfosoftEscalationModal
          ticket={selectedTicketForEscalation}
          isOpen={!!selectedTicketForEscalation}
          onClose={onCloseEscalationModal}
          onEscalated={onEscalationSuccess}
        />
      )}

      {showEscalatedTickets && (
        <FloatingEscalatedTickets
          isOpen={showEscalatedTickets}
          onClose={onCloseEscalatedTickets}
          onTicketResolved={onTicketResolved}
        />
      )}
    </>
  );
};

export default DashboardModals;
