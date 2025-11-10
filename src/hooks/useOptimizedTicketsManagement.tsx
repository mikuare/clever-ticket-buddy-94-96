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
  totalCount: number;
  totalPages: number;
  pageSize: number;
}

const TICKETS_PER_PAGE = 10; // Server-side pagination

// Client-side cache for stats to avoid redundant queries
const statsCache = {
  data: null as TicketStats | null,
  timestamp: 0,
  ttl: 30000 // 30 seconds cache TTL
};

export const useOptimizedTicketsManagement = (isAdmin: boolean, isVerifyingAdmin: boolean) => {
  const { toast } = useToast();
  const [state, setState] = useState<OptimizedTicketsState>({
    tickets: [],
    stats: { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, reopened: 0 },
    loading: true,
    hasMore: true,
    currentPage: 0,
    totalCount: 0,
    totalPages: 1,
    pageSize: TICKETS_PER_PAGE
  });
  
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 3;
  const retryDelays = [1000, 3000, 5000];

  // Check if cached stats are still valid
  const isCacheValid = useCallback(() => {
    return statsCache.data && (Date.now() - statsCache.timestamp) < statsCache.ttl;
  }, []);

  // Optimized query with JOIN to get tickets with user profiles in one request
  const fetchTicketsOptimized = useCallback(async (page = 0) => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const offset = page * TICKETS_PER_PAGE;

      const { data: ticketsData, count, error: ticketsError } = await supabase
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
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + TICKETS_PER_PAGE - 1);

      if (ticketsError) {
        throw ticketsError;
      }

      // Process reopened tickets (no additional database query needed)
      const reopenedTicketIds = new Set(
        ticketsData?.filter(t =>
          t.reopen_count > 0 &&
          t.assigned_admin_id !== null &&
          t.status !== 'Resolved' &&
          t.status !== 'Closed'
        ).map(t => t.id) || []
      );

      // Fetch related profiles for display
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

      transformedTickets.sort((a, b) => {
        if (a.isReopened && !b.isReopened) return -1;
        if (!a.isReopened && b.isReopened) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setState(prev => {
        const totalCountValue = count ?? prev.totalCount;
        const totalPages = totalCountValue > 0 ? Math.max(1, Math.ceil(totalCountValue / TICKETS_PER_PAGE)) : 1;
        const safePage = Math.min(Math.max(page, 0), totalPages - 1);
        const hasMore = safePage < totalPages - 1;

        return {
          ...prev,
          tickets: transformedTickets,
          hasMore,
          currentPage: safePage,
          totalCount: totalCountValue,
          totalPages,
          pageSize: TICKETS_PER_PAGE,
          loading: false
        };
      });

      return transformedTickets;
    } catch (error) {
      console.error('Error in optimized ticket fetch:', error);
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, []);

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
      
      setState(prev => ({ ...prev, stats }));
      return stats;
    } catch (error) {
      console.error('Error fetching consolidated ticket stats:', error);
      // Return default stats on error
      const defaultStats = { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, reopened: 0 };
      setState(prev => ({ ...prev, stats: defaultStats }));
      return defaultStats;
    }
  }, [isCacheValid]);

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

  const handleFetchError = useCallback((error: unknown) => {
    console.error('Ticket pagination error:', error);
    toast({
      title: 'Error',
      description: 'Unable to load tickets. Please try again.',
      variant: 'destructive'
    });
  }, [toast]);

  const goToPage = useCallback(async (page: number) => {
    try {
      const targetPage = Number.isFinite(page) ? Math.max(0, Math.floor(page)) : 0;
      await fetchTicketsOptimized(targetPage);
    } catch (error) {
      handleFetchError(error);
    }
  }, [fetchTicketsOptimized, handleFetchError]);

  const goToFirstPage = useCallback(async () => {
    if (state.currentPage === 0) return;
    try {
      await fetchTicketsOptimized(0);
    } catch (error) {
      handleFetchError(error);
    }
  }, [fetchTicketsOptimized, handleFetchError, state.currentPage]);

  const goToPreviousPage = useCallback(async () => {
    if (state.currentPage <= 0) return;
    try {
      await fetchTicketsOptimized(state.currentPage - 1);
    } catch (error) {
      handleFetchError(error);
    }
  }, [fetchTicketsOptimized, handleFetchError, state.currentPage]);

  const goToNextPage = useCallback(async () => {
    if (state.currentPage >= state.totalPages - 1) return;
    try {
      await fetchTicketsOptimized(state.currentPage + 1);
    } catch (error) {
      handleFetchError(error);
    }
  }, [fetchTicketsOptimized, handleFetchError, state.currentPage, state.totalPages]);

  const goToLastPage = useCallback(async () => {
    const lastPage = Math.max(state.totalPages - 1, 0);
    if (state.currentPage >= lastPage) return;
    try {
      await fetchTicketsOptimized(lastPage);
    } catch (error) {
      handleFetchError(error);
    }
  }, [fetchTicketsOptimized, handleFetchError, state.currentPage, state.totalPages]);

  // Main data loading function with retry and concurrent execution
  const loadData = useCallback(async (reset = true) => {
    try {
      if (reset) {
        setState(prev => ({ ...prev, loading: true }));
      }
      
      await withRetry(async () => {
        if (reset) {
          // Load tickets first (priority), stats in background
          await fetchTicketsOptimized(0);
          fetchTicketStats(); // Don't wait for stats
        }
      });
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load tickets. Please try again.",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [fetchTicketsOptimized, fetchTicketStats, withRetry, toast]);


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

  // Load all remaining tickets at once
  const loadAllTickets = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const { data: ticketsData, count, error: ticketsError } = await supabase
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
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (ticketsError) {
        throw ticketsError;
      }

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

      const reopenedTicketIds = new Set(
        ticketsData?.filter(t =>
          t.reopen_count > 0 &&
          t.assigned_admin_id !== null &&
          t.status !== 'Resolved' &&
          t.status !== 'Closed'
        ).map(t => t.id) || []
      );

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

      transformedTickets.sort((a, b) => {
        if (a.isReopened && !b.isReopened) return -1;
        if (!a.isReopened && b.isReopened) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      const totalCountValue = count ?? transformedTickets.length;
      const totalPages = totalCountValue > 0 ? Math.max(1, Math.ceil(totalCountValue / TICKETS_PER_PAGE)) : 1;

      setState(prev => ({
        ...prev,
        tickets: transformedTickets,
        hasMore: false,
        loading: false,
        totalCount: totalCountValue,
        totalPages,
        currentPage: 0,
        pageSize: TICKETS_PER_PAGE
      }));
    } catch (error) {
      console.error('Failed to load all tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load all tickets. Please try again.',
        variant: 'destructive'
      });
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [toast]);

  return {
    tickets: state.tickets,
    stats: state.stats,
    loading: state.loading,
    hasMore: state.hasMore,
    currentPage: state.currentPage,
    totalCount: state.totalCount,
    totalPages: state.totalPages,
    pageSize: state.pageSize,
    goToPage,
    goToFirstPage,
    goToPreviousPage,
    goToNextPage,
    goToLastPage,
    loadAllTickets,
    refresh,
    updateTicket,
    addTicket,
    removeTicket,
  };
};
