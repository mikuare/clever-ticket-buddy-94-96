
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useTicketActions = (onTicketsUpdate: () => void) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [closingTickets, setClosingTickets] = useState<Set<string>>(new Set());

  const handleCloseTicket = async (ticketId: string, ticketNumber: string) => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to close tickets",
        variant: "destructive"
      });
      return;
    }
    
    setClosingTickets(prev => new Set([...prev, ticketId]));
    
    try {
      console.log(`Attempting to close ticket ${ticketNumber} (ID: ${ticketId}) by user ${profile.id}`);
      
      // First, verify the ticket exists and belongs to the user
      const { data: ticket, error: fetchError } = await supabase
        .from('tickets')
        .select('id, status, user_id')
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
        throw new Error('Only resolved tickets can be closed by users');
      }

      console.log('Ticket verified, proceeding with update');

      // Update the ticket status
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ 
          status: 'Closed',
          user_closed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .eq('user_id', profile.id);

      if (updateError) {
        console.error('Error updating ticket:', updateError);
        throw updateError;
      }

      console.log('Ticket updated successfully');

      // Log activity
      const { error: activityError } = await supabase
        .from('ticket_activities')
        .insert({
          ticket_id: ticketId,
          user_id: profile.id,
          activity_type: 'closed',
          description: `Ticket closed by user`
        });

      if (activityError) {
        console.error('Error logging activity:', activityError);
        // Don't throw here as the main update succeeded
      }

      toast({
        title: "Success",
        description: `Ticket ${ticketNumber} has been closed successfully.`
      });

      // Trigger refresh of tickets list
      onTicketsUpdate();
      
    } catch (error: any) {
      console.error('Error closing ticket:', error);
      
      let errorMessage = "Failed to close ticket. Please try again.";
      
      if (error.message.includes('access denied') || error.message.includes('not found')) {
        errorMessage = "You don't have permission to close this ticket.";
      } else if (error.message.includes('Only resolved tickets')) {
        errorMessage = "This ticket must be resolved before it can be closed.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setClosingTickets(prev => {
        const newSet = new Set(prev);
        newSet.delete(ticketId);
        return newSet;
      });
    }
  };

  return {
    closingTickets,
    handleCloseTicket
  };
};
