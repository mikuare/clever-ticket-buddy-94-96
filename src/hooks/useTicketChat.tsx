
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMessageFetcher } from './chat/useMessageFetcher';
import { useRealtimeSubscription } from './chat/useRealtimeSubscription';
import { useMessageSender } from './chat/useMessageSender';
import { useTypingIndicator } from './chat/useTypingIndicator';

export const useTicketChat = (ticketId: string, isOpen: boolean) => {
  const { profile } = useAuth();
  const {
    messages,
    fetchMessages,
    addMessage,
    replaceMessage,
    removeMessage,
    updateMessage
  } = useMessageFetcher();

  const { setupRealtimeSubscription, cleanup } = useRealtimeSubscription({
    ticketId,
    isOpen,
    currentUserId: profile?.id,
    onNewMessage: addMessage,
    onMessageUpdate: updateMessage
  });

  const { sendMessage, editMessage, loading } = useMessageSender({
    ticketId,
    profile,
    onOptimisticUpdate: addMessage,
    onMessageSent: replaceMessage,
    onMessageError: removeMessage
  });

  const { typingUsers, updateTypingStatus } = useTypingIndicator({
    ticketId,
    userId: profile?.id,
    userName: profile?.full_name,
    isAdmin: profile?.is_admin,
    isOpen
  });

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchMessages(ticketId);
      setupRealtimeSubscription();
    }

    // Cleanup on unmount or when modal closes
    return cleanup;
  }, [isOpen, ticketId, fetchMessages, setupRealtimeSubscription, cleanup]);

  return {
    messages,
    loading,
    sendMessage,
    editMessage,
    currentUserId: profile?.id,
    typingUsers,
    updateTypingStatus,
    updateMessage
  };
};
