import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Ticket } from '@/types/admin';

interface RealtimeSubscription {
  id: string;
  channel: any;
  table: string;
  callback: (payload: any) => void;
}

interface ConnectionStatus {
  connected: boolean;
  lastConnected: Date | null;
  reconnectAttempts: number;
}

export const useRealtimeManager = () => {
  const { toast } = useToast();
  const subscriptionsRef = useRef<Map<string, RealtimeSubscription>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    lastConnected: null,
    reconnectAttempts: 0
  });

  const maxReconnectAttempts = 5;
  const reconnectDelays = [1000, 2000, 4000, 8000, 16000];

  // Centralized connection status handler
  const handleConnectionStatusChange = useCallback((status: string, channelId: string) => {
    console.log(`Realtime connection status for ${channelId}:`, status);
    
    if (status === 'SUBSCRIBED') {
      setConnectionStatus(prev => ({
        ...prev,
        connected: true,
        lastConnected: new Date(),
        reconnectAttempts: 0
      }));
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      setConnectionStatus(prev => ({
        ...prev,
        connected: false
      }));
      
      // Auto-reconnect logic
      attemptReconnect();
    }
  }, []);

  // Auto-reconnect mechanism
  const attemptReconnect = useCallback(() => {
    setConnectionStatus(prev => {
      if (prev.reconnectAttempts >= maxReconnectAttempts) {
        console.log('Max reconnection attempts reached');
        toast({
          title: "Connection Issue",
          description: "Real-time updates may be delayed. Please refresh the page.",
          variant: "destructive",
          duration: 10000
        });
        return prev;
      }

      const delay = reconnectDelays[prev.reconnectAttempts] || 16000;
      console.log(`Attempting reconnection in ${delay}ms (attempt ${prev.reconnectAttempts + 1})`);

      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Recreating realtime subscriptions...');
        recreateSubscriptions();
      }, delay);

      return {
        ...prev,
        reconnectAttempts: prev.reconnectAttempts + 1
      };
    });
  }, [toast]);

  // Recreate all subscriptions
  const recreateSubscriptions = useCallback(() => {
    const subscriptions = Array.from(subscriptionsRef.current.values());
    
    // Clean up existing subscriptions
    subscriptions.forEach(sub => {
      if (sub.channel) {
        supabase.removeChannel(sub.channel);
      }
    });
    
    // Recreate subscriptions
    subscriptions.forEach(sub => {
      subscribeToTable(sub.table, sub.callback, sub.id);
    });
  }, []);

  // Subscribe to a table with optimized channel management
  const subscribeToTable = useCallback((
    table: string, 
    callback: (payload: any) => void, 
    subscriptionId?: string
  ) => {
    const id = subscriptionId || `${table}-${Date.now()}`;
    
    // Remove existing subscription if it exists
    const existingSubscription = subscriptionsRef.current.get(id);
    if (existingSubscription?.channel) {
      supabase.removeChannel(existingSubscription.channel);
    }

    console.log(`Creating optimized subscription for ${table} with ID: ${id}`);
    
    const channel = supabase
      .channel(`realtime-${id}`, {
        config: {
          presence: { key: `user-${Date.now()}` },
          broadcast: { self: false }
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        (payload) => {
          try {
            console.log(`Realtime update for ${table}:`, payload);
            callback(payload);
          } catch (error) {
            console.error(`Error handling realtime update for ${table}:`, error);
          }
        }
      )
      .subscribe((status) => {
        handleConnectionStatusChange(status, id);
      });

    // Store subscription
    subscriptionsRef.current.set(id, {
      id,
      channel,
      table,
      callback
    });

    return id;
  }, [handleConnectionStatusChange]);

  // Unsubscribe from a table
  const unsubscribeFromTable = useCallback((subscriptionId: string) => {
    const subscription = subscriptionsRef.current.get(subscriptionId);
    if (subscription?.channel) {
      console.log(`Removing subscription: ${subscriptionId}`);
      supabase.removeChannel(subscription.channel);
      subscriptionsRef.current.delete(subscriptionId);
    }
  }, []);

  // Subscribe to tickets with optimized handlers
  const subscribeToTickets = useCallback((
    onTicketCreated: (ticket: Ticket) => void,
    onTicketUpdated: (ticket: Ticket, oldTicket: any) => void,
    onTicketDeleted: (ticketId: string) => void
  ) => {
    return subscribeToTable('tickets', async (payload) => {
      try {
        switch (payload.eventType) {
          case 'INSERT':
            // Get user profile efficiently
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', payload.new.user_id)
              .maybeSingle();

            const newTicket: Ticket = {
              ...payload.new,
              profiles: profile ? {
                full_name: profile.full_name,
                email: profile.email
              } : null
            };

            onTicketCreated(newTicket);
            
            // Show notification
            toast({
              title: "👋 HI TEAM",
              description: `🎫 NEW TICKET FROM ${newTicket.department_code}`,
              duration: 4000,
            });
            break;

          case 'UPDATE':
            // Get updated profile if needed
            const { data: updatedProfile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', payload.new.user_id)
              .maybeSingle();

            const updatedTicket: Ticket = {
              ...payload.new,
              profiles: updatedProfile ? {
                full_name: updatedProfile.full_name,
                email: updatedProfile.email
              } : null
            };

            onTicketUpdated(updatedTicket, payload.old);

            // Status change notifications
            if (payload.old.status !== payload.new.status) {
              const statusMessages: Record<string, string> = {
                'In Progress': `Ticket ${payload.new.ticket_number} was assigned`,
                'Resolved': `Ticket ${payload.new.ticket_number} was resolved`,
                'Closed': `Ticket ${payload.new.ticket_number} was closed`
              };

              const message = statusMessages[payload.new.status];
              if (message) {
                toast({
                  title: "📋 Status Update",
                  description: message,
                  duration: 3000,
                });
              }
            }
            break;

          case 'DELETE':
            onTicketDeleted(payload.old.id);
            break;
        }
      } catch (error) {
        console.error('Error processing ticket realtime update:', error);
      }
    }, 'tickets');
  }, [subscribeToTable, toast]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clean up all subscriptions
      Array.from(subscriptionsRef.current.values()).forEach(subscription => {
        if (subscription.channel) {
          supabase.removeChannel(subscription.channel);
        }
      });
      subscriptionsRef.current.clear();

      // Clear reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    connectionStatus,
    subscribeToTable,
    unsubscribeFromTable,
    subscribeToTickets,
    recreateSubscriptions
  };
};