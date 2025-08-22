
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTicketReferrals } from '@/hooks/useTicketReferrals';
import type { Ticket } from '@/types/admin';

interface Profile {
  id: string;
  full_name: string;
  department_code?: string;
}

export const useAdminTicketActions = (profile: Profile | null, fetchTickets: () => void) => {
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [resolvingTickets, setResolvingTickets] = useState<Set<string>>(new Set());
  const { enableReferralForTicket, canReferTicket } = useTicketReferrals(profile?.id || '');

  const handleAssignTicket = async (ticketId: string, ticketNumber: string) => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "Admin profile not found",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log(`Assigning ticket ${ticketNumber} to admin ${profile.full_name}`);
      
      // Get the latest admin's department info to ensure accuracy
      const { data: adminData, error: adminError } = await supabase
        .from('profiles')
        .select('department_code, full_name')
        .eq('id', profile.id)
        .single();

      if (adminError) {
        console.error('Error fetching admin profile:', adminError);
      }

      const adminDepartmentCode = adminData?.department_code || profile.department_code;
      const adminFullName = adminData?.full_name || profile.full_name;
      
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'In Progress',
          assigned_admin_id: profile.id,
          assigned_admin_name: adminFullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) {
        console.error('Error assigning ticket:', error);
        throw error;
      }

      // Log activity with accurate admin and department info
      await supabase
        .from('ticket_activities')
        .insert({
          ticket_id: ticketId,
          user_id: profile.id,
          activity_type: 'assigned',
          description: `Ticket assigned to ${adminFullName}`,
          admin_name: adminFullName,
          department_code: adminDepartmentCode
        });

      toast({
        title: "Ticket Assigned",
        description: `Ticket ${ticketNumber} has been assigned to you.`
      });

      fetchTickets();
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast({
        title: "Error",
        description: "Failed to assign ticket. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleResolveTicket = async (ticketId: string, ticketNumber: string, resolutionNote: string) => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "Admin profile not found",
        variant: "destructive"
      });
      return;
    }

    setResolvingTickets(prev => new Set([...prev, ticketId]));
    
    try {
      console.log(`Resolving ticket ${ticketNumber} by admin ${profile.full_name}`);
      
      // Get the latest admin's department info to ensure accuracy for resolution
      const { data: adminData, error: adminError } = await supabase
        .from('profiles')
        .select('department_code, full_name')
        .eq('id', profile.id)
        .single();

      if (adminError) {
        console.error('Error fetching admin profile:', adminError);
      }

      const adminDepartmentCode = adminData?.department_code || profile.department_code;
      const adminFullName = adminData?.full_name || profile.full_name;
      
      // Get current resolution notes and add the new one
      const { data: currentTicket, error: fetchError } = await supabase
        .from('tickets')
        .select('resolution_notes')
        .eq('id', ticketId)
        .single();

      if (fetchError) {
        console.error('Error fetching current ticket:', fetchError);
        throw fetchError;
      }

      let currentNotes: any[] = [];
      try {
        if (currentTicket?.resolution_notes && Array.isArray(currentTicket.resolution_notes)) {
          currentNotes = currentTicket.resolution_notes;
        }
      } catch (error) {
        console.error('Error parsing current resolution notes:', error);
      }

      const newNote = {
        note: resolutionNote,
        admin_name: adminFullName,
        admin_id: profile.id,
        timestamp: new Date().toISOString()
      };

      const updatedNotes = [...currentNotes, newNote];
      
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'Resolved',
          admin_resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          resolution_notes: updatedNotes
        })
        .eq('id', ticketId);

      if (error) {
        console.error('Error resolving ticket:', error);
        throw error;
      }

      // Log activity with accurate admin and department info
      await supabase
        .from('ticket_activities')
        .insert({
          ticket_id: ticketId,
          user_id: profile.id,
          activity_type: 'resolved',
          description: `Ticket marked as resolved by ${adminFullName}`,
          admin_name: adminFullName,
          department_code: adminDepartmentCode
        });

      toast({
        title: "Ticket Resolved",
        description: `Ticket ${ticketNumber} has been marked as resolved. User will be notified and has 10 minutes to close it manually.`
      });

      fetchTickets();
    } catch (error) {
      console.error('Error resolving ticket:', error);
      toast({
        title: "Error",
        description: "Failed to resolve ticket. Please try again.",       
        variant: "destructive"
      });
    } finally {
      setResolvingTickets(prev => {
        const newSet = new Set(prev);
        newSet.delete(ticketId);
        return newSet;
      });
    }
  };

  const handleOpenTicketChat = async (ticket: Ticket) => {
    // Enable referral for tickets assigned to current admin that are in progress (not resolved)
    if (ticket.assigned_admin_id === profile?.id && ticket.status === 'In Progress') {
      await enableReferralForTicket(ticket.id);
    }
    setSelectedTicket(ticket);
  };

  // Enable referrals for all tickets assigned to current admin that are in progress (not resolved)
  const enableReferralsForAssignedTickets = async (tickets: Ticket[]) => {
    for (const ticket of tickets) {
      if (ticket.assigned_admin_id === profile?.id && ticket.status === 'In Progress') {
        await enableReferralForTicket(ticket.id);
      }
    }
  };

  const handleCloseTicketChat = () => {
    setSelectedTicket(null);
  };

  const canEscalateTicket = (ticket: Ticket) => {
    return ticket.assigned_admin_id === profile?.id && ticket.status === 'In Progress';
  };

  return {
    selectedTicket,
    resolvingTickets,
    canReferTicket,
    canEscalateTicket,
    enableReferralsForAssignedTickets,
    handleAssignTicket,
    handleResolveTicket,
    handleOpenTicketChat,
    handleCloseTicketChat
  };
};
