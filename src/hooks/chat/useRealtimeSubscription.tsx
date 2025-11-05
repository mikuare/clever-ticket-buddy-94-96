
import { useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TicketMessage } from '@/types/admin';

interface UseRealtimeSubscriptionProps {
  ticketId: string;
  isOpen: boolean;
  currentUserId?: string;
  onNewMessage: (message: TicketMessage) => void;
  onMessageUpdate?: (messageId: string, updates: Partial<TicketMessage>) => void;
}

export const useRealtimeSubscription = ({
  ticketId,
  isOpen,
  currentUserId,
  onNewMessage,
  onMessageUpdate
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
        async (payload) => {
          console.log('🔴 REALTIME MESSAGE RECEIVED:', payload);
          const newMessage = payload.new as TicketMessage;
          
          // Ensure the message has all required fields
          if (newMessage && newMessage.id && newMessage.message) {
            console.log('Processing message from user:', newMessage.user_id, 'current user:', currentUserId);
            // Only add messages from OTHER users via realtime
            // Messages from current user are handled by optimistic updates
            if (newMessage.user_id !== currentUserId) {
              console.log('✅ Adding new message to chat:', newMessage.id);
              
              // If message has reply_to, fetch the replied message data
              if (newMessage.reply_to) {
                try {
                  const { data: repliedMsg } = await supabase
                    .from('ticket_messages')
                    .select('id, user_name, message, audio_url')
                    .eq('id', newMessage.reply_to)
                    .single();
                  
                  newMessage.replied_message = repliedMsg || null;
                } catch (error) {
                  console.log('Could not fetch replied message:', error);
                }
              }
              
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
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload) => {
          console.log('🔵 REALTIME MESSAGE UPDATE:', payload);
          const updatedMessage = payload.new as TicketMessage;
          
          if (updatedMessage && updatedMessage.id && onMessageUpdate) {
            // Show update notification for messages from other users
            if (updatedMessage.user_id !== currentUserId) {
              toast({
                title: "Message Updated",
                description: `${updatedMessage.user_name} edited their message`,
                duration: 2000,
              });
            }
            
            // Update the message in the UI
            onMessageUpdate(updatedMessage.id, {
              message: updatedMessage.message,
              is_edited: updatedMessage.is_edited,
              edited_at: updatedMessage.edited_at
            });
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
  }, [ticketId, isOpen, currentUserId, onNewMessage, onMessageUpdate, toast]);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      console.log('Cleaning up channel subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  return { setupRealtimeSubscription, cleanup };
};
