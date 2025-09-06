import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Ticket } from '@/hooks/useUserTickets';

export const useUserTicketStatusNotifications = (tickets: Ticket[]) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [ticketStatusCounts, setTicketStatusCounts] = useState<Map<string, number>>(new Map());

  // Track ticket status changes for user notifications
  useEffect(() => {
    if (!profile?.id || tickets.length === 0) return;

    console.log('Setting up user ticket status notifications');

    const channel = supabase
      .channel('user-ticket-status-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets'
        },
        (payload) => {
          console.log('🔴 USER STATUS NOTIFICATION - Ticket status changed via realtime:', payload);
          const oldTicket = payload.old as any;
          const newTicket = payload.new as any;
          
          // Only notify if this is the user's ticket
          if (newTicket.user_id !== profile.id) return;
          
          // Check if status changed
          if (oldTicket.status !== newTicket.status) {
            console.log('User ticket status changed:', {
              ticket: newTicket.ticket_number,
              from: oldTicket.status,
              to: newTicket.status
            });

            // Track status change notification
            const statusChangeKey = `user_status_viewed_${profile.id}_${newTicket.id}`;
            const lastViewedTime = localStorage.getItem(statusChangeKey);
            const changeTime = new Date(newTicket.updated_at).getTime();
            const lastViewed = lastViewedTime ? new Date(lastViewedTime).getTime() : 0;

            // Only show notification if change is newer than last viewed
            if (changeTime > lastViewed) {
              setTicketStatusCounts(prev => {
                const newCounts = new Map(prev);
                const currentCount = newCounts.get(newTicket.id) || 0;
                newCounts.set(newTicket.id, currentCount + 1);
                return newCounts;
              });

              // Show appropriate toast based on status change
              let title = "Ticket Update";
              let description = "";

              switch (newTicket.status) {
                case 'In Progress':
                  title = "🔧 Ticket Assigned";
                  description = `Your ticket ${newTicket.ticket_number} has been assigned to our support team`;
                  break;
                case 'Resolved':
                  title = "✅ Ticket Resolved";
                  description = `Your ticket ${newTicket.ticket_number} has been resolved`;
                  break;
                case 'Closed':
                  title = "📋 Ticket Closed";
                  description = `Your ticket ${newTicket.ticket_number} has been closed`;
                  break;
                default:
                  description = `Your ticket ${newTicket.ticket_number} status changed to ${newTicket.status}`;
              }

              toast({
                title,
                description,
                duration: 6000,
              });
            }
          }

          // Check if ticket was assigned to an admin
          if (!oldTicket.assigned_admin_id && newTicket.assigned_admin_id) {
            console.log('User ticket assigned to admin:', newTicket.ticket_number);
            
            const assignmentKey = `user_assignment_viewed_${profile.id}_${newTicket.id}`;
            const lastViewedTime = localStorage.getItem(assignmentKey);
            const assignmentTime = new Date(newTicket.updated_at).getTime();
            const lastViewed = lastViewedTime ? new Date(lastViewedTime).getTime() : 0;

            if (assignmentTime > lastViewed) {
              setTicketStatusCounts(prev => {
                const newCounts = new Map(prev);
                const currentCount = newCounts.get(newTicket.id) || 0;
                newCounts.set(newTicket.id, currentCount + 1);
                return newCounts;
              });

              toast({
                title: "👥 Support Assigned",
                description: `Your ticket ${newTicket.ticket_number} has been assigned to ${newTicket.assigned_admin_name || 'our support team'}`,
                duration: 6000,
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('User ticket status subscription:', status);
      });

    return () => {
      console.log('Cleaning up user ticket status notifications');
      supabase.removeChannel(channel);
    };
  }, [profile?.id, tickets, toast]);

  const clearStatusNotificationForTicket = (ticketId: string) => {
    const statusChangeKey = `user_status_viewed_${profile?.id}_${ticketId}`;
    const assignmentKey = `user_assignment_viewed_${profile?.id}_${ticketId}`;
    const currentTime = new Date().toISOString();
    
    localStorage.setItem(statusChangeKey, currentTime);
    localStorage.setItem(assignmentKey, currentTime);
    
    setTicketStatusCounts(prev => {
      const newCounts = new Map(prev);
      newCounts.delete(ticketId);
      return newCounts;
    });
  };

  return {
    ticketStatusCounts,
    clearStatusNotificationForTicket
  };
};