
import { useOptimizedTicketsManagement } from './useOptimizedTicketsManagement';
import { useRealtimeManager } from './useRealtimeManager';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Ticket } from '@/types/admin';

export const useTicketsManagement = (isAdmin: boolean, isVerifyingAdmin: boolean) => {
  const { toast } = useToast();
  const { 
    tickets, 
    stats, 
    loading, 
    hasMore, 
    loadMore, 
    refresh, 
    updateTicket, 
    addTicket, 
    removeTicket 
  } = useOptimizedTicketsManagement(isAdmin, isVerifyingAdmin);
  
  const { subscribeToTickets, connectionStatus } = useRealtimeManager();
  const { timeOperation, trackConnectionIssue } = usePerformanceMonitor();

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


  return {
    tickets,
    stats,
    loading,
    hasMore,
    loadMore,
    fetchTickets,
    refresh,
    connectionStatus
  };
};
