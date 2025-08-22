import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Ticket } from '@/types/admin';

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  reopened: number;
}

interface OptimizedTicketsState {
  tickets: Ticket[];
  stats: TicketStats;
  loading: boolean;
  hasMore: boolean;
  currentPage: number;
}

const TICKETS_PER_PAGE = 1000; // Increased to load all tickets

export const useOptimizedTicketsManagement = (isAdmin: boolean, isVerifyingAdmin: boolean) => {
  const { toast } = useToast();
  const [state, setState] = useState<OptimizedTicketsState>({
    tickets: [],
    stats: { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, reopened: 0 },
    loading: true,
    hasMore: true,
    currentPage: 0
  });
  
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 3;
  const retryDelays = [1000, 3000, 5000];

  // Optimized query with JOIN to get tickets with user profiles in one request
  const fetchTicketsOptimized = useCallback(async (page = 0, reset = true) => {
    try {
      console.log(`Fetching tickets - Page: ${page}, Reset: ${reset}`);
      
      const offset = page * TICKETS_PER_PAGE;
      
      // Get tickets first, then get profiles separately for better performance
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_number,
          title,
          description,
          priority,
          status,
          department_code,
          user_id,
          assigned_admin_id,
          assigned_admin_name,
          attachments,
          resolution_notes,
          created_at,
          updated_at,
          resolved_at,
          admin_resolved_at,
          user_closed_at,
          reopen_count
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + TICKETS_PER_PAGE - 1);

      if (ticketsError) {
        console.error('Optimized tickets query error:', ticketsError);
        throw ticketsError;
      }

      // Get unique user IDs for this batch
      const userIds = Array.from(new Set(ticketsData?.map(ticket => ticket.user_id).filter(Boolean) || []));
      
      let profilesMap = new Map();
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
        
        profilesData?.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }

      // Get reopened ticket IDs to mark them for priority
      const ticketIds = ticketsData?.map(t => t.id) || [];
      let reopenedTicketIds = new Set<string>();
      
      if (ticketIds.length > 0) {
        // Mark tickets as reopened if they have reopen_count > 0, were handled by admins, and are not resolved or closed
        reopenedTicketIds = new Set(
          ticketsData?.filter(t => 
            t.reopen_count > 0 && 
            t.assigned_admin_id !== null &&
            t.status !== 'Resolved' &&
            t.status !== 'Closed'
          ).map(t => t.id) || []
        );
      }

      // Transform to match Ticket interface and mark reopened tickets
      const transformedTickets: Ticket[] = (ticketsData || []).map(ticket => {
        const userProfile = profilesMap.get(ticket.user_id);
        return {
          ...ticket,
          profiles: userProfile ? {
            full_name: userProfile.full_name,
            email: userProfile.email
          } : null,
          isReopened: reopenedTicketIds.has(ticket.id)
        };
      });

      // Sort tickets to prioritize reopened ones at the top
      transformedTickets.sort((a, b) => {
        if (a.isReopened && !b.isReopened) return -1;
        if (!a.isReopened && b.isReopened) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      console.log(`Fetched ${transformedTickets.length} tickets for page ${page}`);
      
      // Update state with new tickets
      setState(prev => ({
        ...prev,
        tickets: reset ? transformedTickets : [...prev.tickets, ...transformedTickets],
        hasMore: transformedTickets.length === TICKETS_PER_PAGE,
        currentPage: page,
        loading: false
      }));

      return transformedTickets;
    } catch (error) {
      console.error('Error in optimized ticket fetch:', error);
      throw error;
    }
  }, []);

  // Separate optimized stats query
  const fetchTicketStats = useCallback(async () => {
    try {
      console.log('Fetching optimized ticket stats...');
      
      // Get stats efficiently with count queries
      const [
        { count: totalCount },
        { count: openCount },
        { count: inProgressCount },
        { count: resolvedCount },
        { count: closedCount }
      ] = await Promise.all([
        supabase.from('tickets').select('*', { count: 'exact', head: true }),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'Open'),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'In Progress'),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'Resolved'),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'Closed')
      ]);

      // Get reopened tickets count - tickets that have reopen_count > 0, were handled by admins, and are not resolved or closed
      const { count: reopenedCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .gt('reopen_count', 0)
        .not('assigned_admin_id', 'is', null)
        .not('status', 'in', '("Resolved","Closed")');

      const stats = {
        total: totalCount || 0,
        open: openCount || 0,
        inProgress: inProgressCount || 0,
        resolved: resolvedCount || 0,
        closed: closedCount || 0,
        reopened: reopenedCount || 0
      };

      console.log('Optimized stats:', stats);
      
      setState(prev => ({ ...prev, stats }));
      return stats;
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
      // Return default stats on error
      const defaultStats = { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, reopened: 0 };
      setState(prev => ({ ...prev, stats: defaultStats }));
      return defaultStats;
    }
  }, []);

  // Retry mechanism with exponential backoff
  const withRetry = useCallback(async (operation: () => Promise<any>, retryCount = 0): Promise<any> => {
    try {
      return await operation();
    } catch (error) {
      if (retryCount < maxRetries) {
        const delay = retryDelays[retryCount] || 5000;
        console.log(`Retrying operation in ${delay}ms (attempt ${retryCount + 1})`);
        
        return new Promise((resolve) => {
          retryTimeoutRef.current = setTimeout(() => {
            resolve(withRetry(operation, retryCount + 1));
          }, delay);
        });
      }
      throw error;
    }
  }, []);

  // Main data loading function with retry
  const loadData = useCallback(async (reset = true) => {
    try {
      setState(prev => ({ ...prev, loading: reset }));
      
      await withRetry(async () => {
        // Load tickets and stats in parallel for better performance
        await Promise.all([
          fetchTicketsOptimized(reset ? 0 : state.currentPage + 1, reset),
          reset ? fetchTicketStats() : Promise.resolve()
        ]);
      });
    } catch (error) {
      console.error('Failed to load tickets after retries:', error);
      toast({
        title: "Error",
        description: "Failed to load tickets. Please check your connection and try again.",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [fetchTicketsOptimized, fetchTicketStats, withRetry, toast, state.currentPage]);

  // Load more tickets (pagination)
  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.loading) return;
    await loadData(false);
  }, [loadData, state.hasMore, state.loading]);

  // Refresh data
  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  // Update single ticket in state (for real-time updates)
  const updateTicket = useCallback((ticketId: string, updatedTicket: Partial<Ticket>) => {
    setState(prev => ({
      ...prev,
      tickets: prev.tickets.map(ticket =>
        ticket.id === ticketId ? { ...ticket, ...updatedTicket } : ticket
      )
    }));
  }, []);

  // Add new ticket to state
  const addTicket = useCallback((newTicket: Ticket) => {
    setState(prev => ({
      ...prev,
      tickets: [newTicket, ...prev.tickets],
      stats: {
        ...prev.stats,
        total: prev.stats.total + 1,
        [newTicket.status.toLowerCase().replace(' ', '')]: prev.stats[newTicket.status.toLowerCase().replace(' ', '') as keyof TicketStats] + 1
      }
    }));
  }, []);

  // Remove ticket from state
  const removeTicket = useCallback((ticketId: string) => {
    setState(prev => ({
      ...prev,
      tickets: prev.tickets.filter(ticket => ticket.id !== ticketId)
    }));
  }, []);

  // Initial data loading
  useEffect(() => {
    if (isAdmin && !isVerifyingAdmin) {
      console.log('Admin verified, loading optimized tickets data...');
      loadData(true);
    }

    // Cleanup retry timeout on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [isAdmin, isVerifyingAdmin, loadData]);

  return {
    tickets: state.tickets,
    stats: state.stats,
    loading: state.loading,
    hasMore: state.hasMore,
    currentPage: state.currentPage,
    loadMore,
    refresh,
    updateTicket,
    addTicket,
    removeTicket
  };
};
