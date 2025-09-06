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
<<<<<<< HEAD
}

const TICKETS_PER_PAGE = 1000; // Increased to load all tickets
=======
  totalCount: number;
}

const TICKETS_PER_PAGE = 50; // Server-side pagination

// Client-side cache for stats to avoid redundant queries
const statsCache = {
  data: null as TicketStats | null,
  timestamp: 0,
  ttl: 30000 // 30 seconds cache TTL
};
>>>>>>> main

export const useOptimizedTicketsManagement = (isAdmin: boolean, isVerifyingAdmin: boolean) => {
  const { toast } = useToast();
  const [state, setState] = useState<OptimizedTicketsState>({
    tickets: [],
    stats: { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, reopened: 0 },
    loading: true,
    hasMore: true,
<<<<<<< HEAD
    currentPage: 0
=======
    currentPage: 0,
    totalCount: 0
>>>>>>> main
  });
  
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 3;
  const retryDelays = [1000, 3000, 5000];

<<<<<<< HEAD
=======
  // Check if cached stats are still valid
  const isCacheValid = useCallback(() => {
    return statsCache.data && (Date.now() - statsCache.timestamp) < statsCache.ttl;
  }, []);

>>>>>>> main
  // Optimized query with JOIN to get tickets with user profiles in one request
  const fetchTicketsOptimized = useCallback(async (page = 0, reset = true) => {
    try {
      console.log(`Fetching tickets - Page: ${page}, Reset: ${reset}`);
      
      const offset = page * TICKETS_PER_PAGE;
      
<<<<<<< HEAD
=======
      // Get total count first for pagination
      const { count: totalCount, error: countError } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error getting total count:', countError);
        throw countError;
      }

>>>>>>> main
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
<<<<<<< HEAD
        hasMore: transformedTickets.length === TICKETS_PER_PAGE,
        currentPage: page,
        loading: false
=======
        hasMore: (offset + transformedTickets.length) < (totalCount || 0),
        currentPage: page,
        loading: false,
        totalCount: totalCount || 0
>>>>>>> main
      }));

      return transformedTickets;
    } catch (error) {
      console.error('Error in optimized ticket fetch:', error);
      throw error;
    }
  }, []);

<<<<<<< HEAD
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
=======
  // Optimized stats query using consolidated database function with caching
  const fetchTicketStats = useCallback(async (forceRefresh = false) => {
    try {
      // Check cache first unless forcing refresh
      if (!forceRefresh && isCacheValid()) {
        console.log('Using cached ticket stats');
        setState(prev => ({ ...prev, stats: statsCache.data! }));
        return statsCache.data!;
      }

      console.log('Fetching consolidated ticket stats...');
      
      // Use the new consolidated stats function for optimal performance
      const { data: statsData, error } = await supabase
        .rpc('get_consolidated_ticket_stats');

      if (error) {
        console.error('Error calling consolidated stats function:', error);
        throw error;
      }

      // Extract stats from the first row of results
      const statsRow = statsData?.[0];
      const stats = {
        total: Number(statsRow?.total_count || 0),
        open: Number(statsRow?.open_count || 0),
        inProgress: Number(statsRow?.in_progress_count || 0),
        resolved: Number(statsRow?.resolved_count || 0),
        closed: Number(statsRow?.closed_count || 0),
        reopened: Number(statsRow?.reopened_count || 0)
      };

      console.log('Consolidated stats:', stats);

      // Update cache
      statsCache.data = stats;
      statsCache.timestamp = Date.now();
>>>>>>> main
      
      setState(prev => ({ ...prev, stats }));
      return stats;
    } catch (error) {
<<<<<<< HEAD
      console.error('Error fetching ticket stats:', error);
=======
      console.error('Error fetching consolidated ticket stats:', error);
>>>>>>> main
      // Return default stats on error
      const defaultStats = { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, reopened: 0 };
      setState(prev => ({ ...prev, stats: defaultStats }));
      return defaultStats;
    }
<<<<<<< HEAD
  }, []);
=======
  }, [isCacheValid]);
>>>>>>> main

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

<<<<<<< HEAD
  // Main data loading function with retry
=======
  // Load more tickets (pagination)
  const loadMore = useCallback(async () => {
    setState(prev => {
      if (!prev.hasMore || prev.loading) return prev;
      
      const nextPage = prev.currentPage + 1;
      console.log(`Loading more tickets - Page: ${nextPage}`);
      
      // Start loading
      fetchTicketsOptimized(nextPage, false).catch(error => {
        console.error('Failed to load more tickets:', error);
        toast({
          title: "Error",
          description: "Failed to load more tickets. Please try again.",
          variant: "destructive"
        });
        setState(curr => ({ ...curr, loading: false }));
      });
      
      return { ...prev, loading: true };
    });
  }, [fetchTicketsOptimized, toast]);

  // Main data loading function with retry and concurrent execution
>>>>>>> main
  const loadData = useCallback(async (reset = true) => {
    try {
      setState(prev => ({ ...prev, loading: reset }));
      
      await withRetry(async () => {
<<<<<<< HEAD
        // Load tickets and stats in parallel for better performance
        await Promise.all([
          fetchTicketsOptimized(reset ? 0 : state.currentPage + 1, reset),
          reset ? fetchTicketStats() : Promise.resolve()
        ]);
=======
        if (reset) {
          // For initial load, run tickets and stats concurrently
          console.log('Running concurrent initial data load...');
          await Promise.all([
            fetchTicketsOptimized(0, true),
            fetchTicketStats()
          ]);
          console.log('Concurrent initial data load completed');
        }
>>>>>>> main
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
<<<<<<< HEAD
  }, [fetchTicketsOptimized, fetchTicketStats, withRetry, toast, state.currentPage]);

  // Load more tickets (pagination)
  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.loading) return;
    await loadData(false);
  }, [loadData, state.hasMore, state.loading]);
=======
  }, [fetchTicketsOptimized, fetchTicketStats, withRetry, toast]);

>>>>>>> main

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

<<<<<<< HEAD
=======
  // Load all remaining tickets at once
  const loadAllTickets = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Calculate how many tickets we need to load
      const remainingTickets = state.totalCount - state.tickets.length;
      if (remainingTickets <= 0) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      console.log(`Loading all remaining ${remainingTickets} tickets...`);
      
      // Get all remaining tickets in one query
      const offset = state.tickets.length;
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
        .range(offset, state.totalCount - 1);

      if (ticketsError) {
        console.error('Error loading all tickets:', ticketsError);
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

      // Get reopened ticket IDs
      const ticketIds = ticketsData?.map(t => t.id) || [];
      let reopenedTicketIds = new Set<string>();
      
      if (ticketIds.length > 0) {
        reopenedTicketIds = new Set(
          ticketsData?.filter(t => 
            t.reopen_count > 0 && 
            t.assigned_admin_id !== null &&
            t.status !== 'Resolved' &&
            t.status !== 'Closed'
          ).map(t => t.id) || []
        );
      }

      // Transform tickets
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

      // Sort tickets to prioritize reopened ones
      transformedTickets.sort((a, b) => {
        if (a.isReopened && !b.isReopened) return -1;
        if (!a.isReopened && b.isReopened) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      console.log(`Loaded ${transformedTickets.length} additional tickets`);
      
      // Update state with all tickets
      setState(prev => ({
        ...prev,
        tickets: [...prev.tickets, ...transformedTickets],
        hasMore: false,
        loading: false
      }));

    } catch (error) {
      console.error('Failed to load all tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load all tickets. Please try again.",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.tickets.length, state.totalCount, toast]);

>>>>>>> main
  return {
    tickets: state.tickets,
    stats: state.stats,
    loading: state.loading,
    hasMore: state.hasMore,
    currentPage: state.currentPage,
<<<<<<< HEAD
    loadMore,
    refresh,
    updateTicket,
    addTicket,
    removeTicket
=======
    totalCount: state.totalCount,
    loadMore,
    loadAllTickets,
    refresh,
    updateTicket,
    addTicket,
    removeTicket,
>>>>>>> main
  };
};
