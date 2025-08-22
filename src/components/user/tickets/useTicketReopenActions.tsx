import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useTicketReopenActions = (onTicketsUpdate: () => void) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [reopeningTickets, setReopeningTickets] = useState<Set<string>>(new Set());

  const handleReopenTicket = async (ticketId: string, ticketNumber: string) => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to reopen tickets",
        variant: "destructive"
      });
      return;
    }
    
    setReopeningTickets(prev => new Set([...prev, ticketId]));
    
    try {
      console.log(`Attempting to reopen ticket ${ticketNumber} (ID: ${ticketId}) by user ${profile.id}`);
      console.log('Current ticket details before reopen:', { ticketId, ticketNumber });
      // First, verify the ticket exists and belongs to the user
      const { data: ticket, error: fetchError } = await supabase
        .from('tickets')
        .select('id, status, user_id, assigned_admin_id, assigned_admin_name')
        .eq('id', ticketId)
        .eq('user_id', profile.id)
        .single();

      if (fetchError) {
        console.error('Error fetching ticket:', fetchError);
        throw new Error('Ticket not found or access denied');
      }

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      if (ticket.status !== 'Resolved') {
        throw new Error('Only resolved tickets can be reopened');
      }

      console.log('Ticket verified, proceeding with reopening. Original admin:', ticket.assigned_admin_id, ticket.assigned_admin_name);

      // Update the ticket status back to In Progress, preserve admin assignment, and add reopened timestamp
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ 
          status: 'In Progress',
          admin_resolved_at: null,
          user_closed_at: null,
          assigned_admin_id: ticket.assigned_admin_id, // Preserve original admin assignment
          assigned_admin_name: ticket.assigned_admin_name, // Preserve original admin name
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .eq('user_id', profile.id);

      if (updateError) {
        console.error('Error updating ticket:', updateError);
        throw updateError;
      }

      console.log('Ticket reopened successfully');

      // Log activity
      const { error: activityError } = await supabase
        .from('ticket_activities')
        .insert({
          ticket_id: ticketId,
          user_id: profile.id,
          activity_type: 'reopened',
          description: `Ticket reopened by user - resolution not satisfactory`
        });

      if (activityError) {
        console.error('Error logging activity:', activityError);
        // Don't throw here as the main update succeeded
      }

      toast({
        title: "Success",
        description: `Ticket ${ticketNumber} has been reopened. Our support team will review it again.`
      });

      // Trigger refresh of tickets list
      onTicketsUpdate();
      
    } catch (error: any) {
      console.error('Error reopening ticket:', error);
      
      let errorMessage = "Failed to reopen ticket. Please try again.";
      
      if (error.message.includes('access denied') || error.message.includes('not found')) {
        errorMessage = "You don't have permission to reopen this ticket.";
      } else if (error.message.includes('Only resolved tickets')) {
        errorMessage = "This ticket can only be reopened if it's currently resolved.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setReopeningTickets(prev => {
        const newSet = new Set(prev);
        newSet.delete(ticketId);
        return newSet;
      });
    }
  };

  return {
    reopeningTickets,
    handleReopenTicket
  };
};