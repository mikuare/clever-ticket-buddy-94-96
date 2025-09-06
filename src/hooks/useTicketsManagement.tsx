
import { useOptimizedTicketsManagement } from './useOptimizedTicketsManagement';
import { useRealtimeManager } from './useRealtimeManager';
import { usePerformanceMonitor } from './usePerformanceMonitor';
<<<<<<< HEAD
import { useEffect } from 'react';
=======
import { useEffect, useState } from 'react';
>>>>>>> main
import { useToast } from '@/hooks/use-toast';
import type { Ticket } from '@/types/admin';

export const useTicketsManagement = (isAdmin: boolean, isVerifyingAdmin: boolean) => {
  const { toast } = useToast();
  const { 
    tickets, 
    stats, 
    loading, 
    hasMore, 
<<<<<<< HEAD
    loadMore, 
=======
    totalCount,
    loadMore, 
    loadAllTickets: loadAllTicketsFromHook,
>>>>>>> main
    refresh, 
    updateTicket, 
    addTicket, 
    removeTicket 
  } = useOptimizedTicketsManagement(isAdmin, isVerifyingAdmin);
  
  const { subscribeToTickets, connectionStatus } = useRealtimeManager();
  const { timeOperation, trackConnectionIssue } = usePerformanceMonitor();
<<<<<<< HEAD

  // Real-time subscriptions setup
  useEffect(() => {
    if (!isAdmin || isVerifyingAdmin) return;

    console.log('Setting up optimized real-time subscriptions...');
    
    const subscriptionId = subscribeToTickets(
      // On ticket created
      (newTicket: Ticket) => {
        addTicket(newTicket);
      },
      // On ticket updated  
      (updatedTicket: Ticket, oldTicket: any) => {
        updateTicket(updatedTicket.id, updatedTicket);
      },
      // On ticket deleted
      (ticketId: string) => {
        removeTicket(ticketId);
      }
    );

    return () => {
      console.log('Cleaning up optimized subscriptions');
    };
  }, [isAdmin, isVerifyingAdmin, subscribeToTickets, addTicket, updateTicket, removeTicket]);
=======
  
  // State to track if real-time subscriptions are initialized
  const [subscriptionsInitialized, setSubscriptionsInitialized] = useState(false);

  // Lazy loading: Initialize real-time subscriptions only after initial data load
  useEffect(() => {
    if (!isAdmin || isVerifyingAdmin || loading || subscriptionsInitialized) return;

    console.log('Initial data loaded, setting up lazy-loaded real-time subscriptions...');
    
    // Add a small delay to ensure UI is responsive after data load
    const initTimeout = setTimeout(() => {
      const subscriptionId = subscribeToTickets(
        // On ticket created
        (newTicket: Ticket) => {
          addTicket(newTicket);
        },
        // On ticket updated  
        (updatedTicket: Ticket, oldTicket: any) => {
          updateTicket(updatedTicket.id, updatedTicket);
        },
        // On ticket deleted
        (ticketId: string) => {
          removeTicket(ticketId);
        }
      );

      setSubscriptionsInitialized(true);
      console.log('Lazy-loaded real-time subscriptions initialized');
    }, 500); // 500ms delay for better UX

    return () => {
      clearTimeout(initTimeout);
    };
  }, [isAdmin, isVerifyingAdmin, loading, subscriptionsInitialized, subscribeToTickets, addTicket, updateTicket, removeTicket]);
>>>>>>> main

  // Monitor connection status
  useEffect(() => {
    if (!connectionStatus.connected && connectionStatus.reconnectAttempts > 0) {
      trackConnectionIssue('Real-time connection lost. Attempting to reconnect...');
    }
  }, [connectionStatus, trackConnectionIssue]);

  // Fetch tickets wrapper with performance monitoring
  const fetchTickets = async () => {
    return timeOperation('fetchTickets', async () => {
      return refresh();
    });
  };


<<<<<<< HEAD
=======
  // Load all tickets function - use the optimized version from the hook
  const loadAllTickets = async () => {
    return timeOperation('loadAllTickets', async () => {
      return loadAllTicketsFromHook();
    });
  };

>>>>>>> main
  return {
    tickets,
    stats,
    loading,
    hasMore,
<<<<<<< HEAD
    loadMore,
=======
    totalCount,
    loadMore,
    loadAllTickets,
>>>>>>> main
    fetchTickets,
    refresh,
    connectionStatus
  };
};
