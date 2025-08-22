
import { useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TicketMessage } from '@/types/admin';

interface UseRealtimeSubscriptionProps {
  ticketId: string;
  isOpen: boolean;
  currentUserId?: string;
  onNewMessage: (message: TicketMessage) => void;
}

export const useRealtimeSubscription = ({
  ticketId,
  isOpen,
  currentUserId,
  onNewMessage
}: UseRealtimeSubscriptionProps) => {
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  const setupRealtimeSubscription = useCallback(() => {
    if (!isOpen || !ticketId) {
      console.log('Skipping realtime setup - isOpen:', isOpen, 'ticketId:', ticketId);
      return;
    }

    // Clean up existing subscription first
    if (channelRef.current) {
      console.log('Cleaning up existing subscription');
      supabase.removeChannel(channelRef.current);
    }

    console.log('Setting up realtime subscription for ticket:', ticketId, 'currentUserId:', currentUserId);
    
    const channel = supabase
      .channel(`ticket-chat-${ticketId}`, {
        config: {
          broadcast: { self: true }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload) => {
          console.log('🔴 REALTIME MESSAGE RECEIVED:', payload);
          const newMessage = payload.new as TicketMessage;
          
          // Ensure the message has all required fields
          if (newMessage && newMessage.id && newMessage.message) {
            console.log('Processing message from user:', newMessage.user_id, 'current user:', currentUserId);
            // Only add messages from OTHER users via realtime
            // Messages from current user are handled by optimistic updates
            if (newMessage.user_id !== currentUserId) {
              console.log('✅ Adding new message to chat:', newMessage.id);
              onNewMessage(newMessage);
              toast({
                title: "New Message",
                description: `${newMessage.user_name} sent a message`,
                duration: 3000,
              });
            } else {
              console.log('⏭️ Skipping own message:', newMessage.id);
            }
          } else {
            console.log('❌ Invalid message format:', newMessage);
          }
        }
      )
      .subscribe((status) => {
        console.log('💡 Realtime subscription status for', ticketId, ':', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time updates for ticket:', ticketId);
        }
      });

    channelRef.current = channel;
  }, [ticketId, isOpen, currentUserId, onNewMessage, toast]);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      console.log('Cleaning up channel subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  return { setupRealtimeSubscription, cleanup };
};
