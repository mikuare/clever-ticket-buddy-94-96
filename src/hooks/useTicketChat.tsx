
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMessageFetcher } from './chat/useMessageFetcher';
import { useRealtimeSubscription } from './chat/useRealtimeSubscription';
import { useMessageSender } from './chat/useMessageSender';

export const useTicketChat = (ticketId: string, isOpen: boolean) => {
  const { profile } = useAuth();
  const {
    messages,
    fetchMessages,
    addMessage,
    replaceMessage,
    removeMessage
  } = useMessageFetcher();

  const { setupRealtimeSubscription, cleanup } = useRealtimeSubscription({
    ticketId,
    isOpen,
    currentUserId: profile?.id,
    onNewMessage: addMessage
  });

  const { sendMessage, loading } = useMessageSender({
    ticketId,
    profile,
    onOptimisticUpdate: addMessage,
    onMessageSent: replaceMessage,
    onMessageError: removeMessage
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
    currentUserId: profile?.id
  };
};
