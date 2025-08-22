
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import type { EscalatedTicket } from '../types';

export const useEscalatedTickets = (isOpen: boolean, onTicketResolved: () => void) => {
  const { toast } = useToast();
  const { user } = useAdminAuth();
  const [escalatedTickets, setEscalatedTickets] = useState<EscalatedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingTickets, setResolvingTickets] = useState<Set<string>>(new Set());

  const fetchEscalatedTickets = async () => {
    try {
      console.log('Fetching escalated tickets...');
      
      const { data, error } = await supabase.rpc('get_escalated_tickets');

      if (error) {
        console.error('Error fetching escalated tickets:', error);
        throw error;
      }

      console.log('Escalated tickets fetched:', data);
      setEscalatedTickets(data || []);
    } catch (error) {
      console.error('Error fetching escalated tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load escalated tickets. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveEscalation = async (escalationId: string, ticketNumber: string, resolutionNote: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    setResolvingTickets(prev => new Set([...prev, escalationId]));

    try {
      console.log(`Resolving escalation ${escalationId} for ticket ${ticketNumber} with note`);
      
      const { error } = await supabase.rpc('resolve_infosoft_escalation_with_notes', {
        p_escalation_id: escalationId,
        p_admin_id: user.id,
        p_resolution_note: resolutionNote
      });

      if (error) {
        console.error('Error resolving escalation:', error);
        throw error;
      }

      toast({
        title: "Escalation Resolved",
        description: `Ticket ${ticketNumber} has been marked as resolved and removed from escalations.`
      });

      onTicketResolved();
      fetchEscalatedTickets();
    } catch (error: any) {
      console.error('Error resolving escalation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to resolve escalation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setResolvingTickets(prev => {
        const newSet = new Set(prev);
        newSet.delete(escalationId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEscalatedTickets();
      
      // Set up real-time subscription for escalations
      const channel = supabase
        .channel('escalated-tickets')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'infosoft_escalations'
          },
          () => {
            console.log('Escalation change detected, refreshing...');
            fetchEscalatedTickets();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen]);

  return {
    escalatedTickets,
    loading,
    resolvingTickets,
    handleResolveEscalation,
    user
  };
};
