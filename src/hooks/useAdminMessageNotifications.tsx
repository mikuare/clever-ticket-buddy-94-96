
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Ticket } from '@/types/admin';

export const useAdminMessageNotifications = (
  isAdmin: boolean,
  profile: any,
  tickets: Ticket[]
) => {
  const { toast } = useToast();
  const [ticketMessageCounts, setTicketMessageCounts] = useState<Map<string, number>>(new Map());

  // Load initial message counts for tickets
  useEffect(() => {
    if (!isAdmin || !profile?.id || tickets.length === 0) return;

    let mounted = true;

    const loadMessageCounts = async () => {
      console.log('Loading initial message counts for admin tickets');
      
      const countPromises = tickets.map(async (ticket) => {
        const shouldTrackCount = 
          (ticket.status === 'Open') ||
          (ticket.assigned_admin_id === profile.id);

        if (!shouldTrackCount) return null;

        try {
          const chatOpenKey = `admin_chat_opened_${profile.id}_${ticket.id}`;
          const lastOpenedTime = localStorage.getItem(chatOpenKey);
          
          let query = supabase
            .from('ticket_messages')
            .select('id, user_id, created_at')
            .eq('ticket_id', ticket.id)
            .neq('user_id', profile.id);

          if (lastOpenedTime) {
            query = query.gt('created_at', lastOpenedTime);
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
      
      if (!mounted) return;
      
      const newCounts = new Map<string, number>();
      
      results.forEach(result => {
        if (result && result.count > 0) {
          newCounts.set(result.ticketId, result.count);
          console.log(`Admin ticket ${result.ticketId} has ${result.count} unread messages`);
        }
      });

      if (newCounts.size > 0) {
        console.log('Setting initial admin message counts:', newCounts);
        setTicketMessageCounts(newCounts);
      }
    };

    loadMessageCounts();

    return () => {
      mounted = false;
    };
  }, [isAdmin, profile?.id, tickets]);

  // Set up global message notifications for admins
  useEffect(() => {
    if (!isAdmin || !profile?.id || tickets.length === 0) return;

    let mounted = true;
    let channel: any = null;
    
    console.log('Setting up admin message notifications channel for', tickets.length, 'tickets');

    const channelName = `admin-message-notifications-${profile.id}`;
    
    channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages'
        },
        (payload) => {
          if (!mounted) return;
          
          console.log('🔴 ADMIN NOTIFICATION - New message received via realtime:', payload);
          const newMessage = payload.new as any;
          
          const ticket = tickets.find(t => t.id === newMessage.ticket_id);
          if (!ticket) {
            console.log('Ticket not found for message:', newMessage.ticket_id);
            return;
          }

          const shouldNotify = 
            (ticket.status === 'Open') ||
            (ticket.assigned_admin_id === profile.id);

          if (shouldNotify && newMessage.user_id !== profile.id) {
            const chatOpenKey = `admin_chat_opened_${profile.id}_${newMessage.ticket_id}`;
            const lastOpenedTime = localStorage.getItem(chatOpenKey);
            const messageTime = new Date(newMessage.created_at).getTime();
            const recentlyOpened = lastOpenedTime && (messageTime <= new Date(lastOpenedTime).getTime());

            if (!recentlyOpened) {
              setTicketMessageCounts(prev => {
                const newCounts = new Map(prev);
                const currentCount = newCounts.get(newMessage.ticket_id) || 0;
                const newCount = currentCount + 1;
                newCounts.set(newMessage.ticket_id, newCount);
                console.log(`Updated admin count for ticket ${newMessage.ticket_id}: ${newCount}`);
                return newCounts;
              });
              
              // Enhanced toast notification with sound indication
              toast({
                title: "🔔 New Message",
                description: `New message in ticket: ${ticket.ticket_number} - ${ticket.title}`,
                duration: 6000,
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Admin notification subscription status:', status);
      });

    return () => {
      mounted = false;
      if (channel) {
        console.log('Cleaning up admin notification channel');
        supabase.removeChannel(channel);
      }
    };
  }, [isAdmin, profile?.id, tickets, toast]);

  const clearNotificationForTicket = (ticketId: string) => {
    const chatOpenKey = `admin_chat_opened_${profile?.id}_${ticketId}`;
    const currentTime = new Date().toISOString();
    localStorage.setItem(chatOpenKey, currentTime);
    
    setTicketMessageCounts(prev => {
      const newCounts = new Map(prev);
      newCounts.delete(ticketId);
      console.log('Cleared admin notifications for ticket:', ticketId);
      return newCounts;
    });
  };

  return {
    ticketMessageCounts,
    clearNotificationForTicket
  };
};
