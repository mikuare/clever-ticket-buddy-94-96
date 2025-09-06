
import { useEffect } from 'react';
import UserTicketChat from '@/components/UserTicketChat';
import { useAuth } from '@/hooks/useAuth';
import type { Ticket } from '@/hooks/useUserTickets';

interface UserTicketChatModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  hasNewMessage?: boolean;
  onTicketViewed?: (ticketId: string) => void;
}

const UserTicketChatModal = ({ ticket, isOpen, onClose, hasNewMessage, onTicketViewed }: UserTicketChatModalProps) => {
  const { profile } = useAuth();

  // Clear notifications when chat is opened
  useEffect(() => {
    if (isOpen && ticket && onTicketViewed) {
      onTicketViewed(ticket.id);
    }
  }, [isOpen, ticket?.id, onTicketViewed]);

  if (!ticket || !isOpen) {
    return null;
  }

  return (
    <UserTicketChat
      ticket={ticket}
      isOpen={isOpen}
      onClose={onClose}
      hasNewMessage={hasNewMessage}
    />
  );
};

export default UserTicketChatModal;
