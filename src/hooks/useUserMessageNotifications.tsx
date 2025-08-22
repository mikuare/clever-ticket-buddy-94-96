
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  status: string;
}

export const useUserMessageNotifications = (tickets: Ticket[]) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [ticketMessageCounts, setTicketMessageCounts] = useState<Map<string, number>>(new Map());

  // Load initial message counts when tickets are loaded
  useEffect(() => {
    if (!profile?.id || tickets.length === 0) return;

    const loadMessageCounts = async () => {
      console.log('Loading initial message counts for user tickets');
      
      const countPromises = tickets.map(async (ticket) => {
        try {
          // Get the last time this user viewed messages for this ticket
          const lastViewedKey = `user_messages_last_viewed_${profile.id}_${ticket.id}`;
          const lastViewedTime = localStorage.getItem(lastViewedKey);
          
          let query = supabase
            .from('ticket_messages')
            .select('id, user_id, created_at')
            .eq('ticket_id', ticket.id)
            .neq('user_id', profile.id) // Only count messages not from current user
            .order('created_at', { ascending: false });

          // If we have a last viewed time, only count messages after that time
          if (lastViewedTime) {
            query = query.gt('created_at', lastViewedTime);
          }

          const { data: messages, error } = await query;

          if (error) {
            console.error('Error fetching messages for ticket:', ticket.id, error);
            return null;
          }

          return {
            ticketId: ticket.id,
            count: messages?.length || 0
          };
        } catch (error) {
          console.error('Error in loadMessageCounts:', error);
          return null;
        }
      });

      const results = await Promise.all(countPromises);
      const newCounts = new Map<string, number>();
      
      results.forEach(result => {
        if (result && result.count > 0) {
          newCounts.set(result.ticketId, result.count);
          console.log(`User ticket ${result.ticketId} has ${result.count} unread messages`);
        }
      });

      if (newCounts.size > 0) {
        console.log('Setting initial user message counts:', newCounts);
        setTicketMessageCounts(newCounts);
      }
    };

    loadMessageCounts();
  }, [profile?.id, tickets]);

  // Set up global message notifications
  useEffect(() => {
    if (!profile?.id || tickets.length === 0) return;

    console.log('Setting up user message notifications channel for', tickets.length, 'tickets');

    const channel = supabase
      .channel(`user-message-notifications-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages'
        },
        (payload) => {
          console.log('🔴 USER NOTIFICATION - User received new message via realtime:', payload);
          const newMessage = payload.new as any;
          
          // Check if this message is for one of the user's tickets and not from the user
          if (newMessage.user_id !== profile.id) {
            // Check if this ticket belongs to the current user
            const userTicket = tickets.find(ticket => ticket.id === newMessage.ticket_id);
            if (userTicket) {
              console.log('Message is for user ticket:', userTicket.ticket_number);
              
              // Check if user has viewed messages recently for this ticket
              const lastViewedKey = `user_messages_last_viewed_${profile?.id}_${newMessage.ticket_id}`;
              const lastViewedTime = localStorage.getItem(lastViewedKey);
              const messageTime = new Date(newMessage.created_at).getTime();
              const lastViewed = lastViewedTime ? new Date(lastViewedTime).getTime() : 0;

              // Only show notification if message is newer than last viewed time
              if (messageTime > lastViewed) {
                setTicketMessageCounts(prev => {
                  const newCounts = new Map(prev);
                  const currentCount = newCounts.get(newMessage.ticket_id) || 0;
                  const newCount = currentCount + 1;
                  newCounts.set(newMessage.ticket_id, newCount);
                  console.log(`Updated user count for ticket ${newMessage.ticket_id}: ${newCount}`);
                  return newCounts;
                });
                
                toast({
                  title: "💬 New Message from Support Team",
                  description: `📩 You have received a new message in ticket ${userTicket.ticket_number}. Our support team has responded to your request. Click to view the message and continue the conversation.`,
                  duration: 6000,
                });
              }
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('User notification subscription status:', status);
      });

    return () => {
      console.log('Cleaning up user notification channel');
      supabase.removeChannel(channel);
    };
  }, [profile?.id, tickets, toast]);

  const clearNotificationForTicket = (ticketId: string) => {
    // Mark messages as viewed with current timestamp
    const lastViewedKey = `user_messages_last_viewed_${profile?.id}_${ticketId}`;
    const currentTime = new Date().toISOString();
    localStorage.setItem(lastViewedKey, currentTime);
    
    // Clear the notification count
    setTicketMessageCounts(prev => {
      const newCounts = new Map(prev);
      newCounts.delete(ticketId);
      console.log('Cleared user notifications for ticket:', ticketId, 'at', currentTime);
      return newCounts;
    });
  };

  return {
    ticketMessageCounts,
    clearNotificationForTicket
  };
};
