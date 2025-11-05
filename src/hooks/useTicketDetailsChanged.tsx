import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTicketDetailsChanged = (ticketId: string) => {
  const [hasDetailsChanged, setHasDetailsChanged] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDetailsChanged = async () => {
      try {
        const { data, error } = await supabase
          .from('ticket_activities')
          .select('id')
          .eq('ticket_id', ticketId)
          .eq('activity_type', 'details_updated')
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error checking ticket details changed:', error);
          setHasDetailsChanged(false);
        } else {
          setHasDetailsChanged(!!data);
        }
      } catch (error) {
        console.error('Error in checkDetailsChanged:', error);
        setHasDetailsChanged(false);
      } finally {
        setLoading(false);
      }
    };

    checkDetailsChanged();

    // Subscribe to real-time updates for this ticket's activities
    const channel = supabase
      .channel(`ticket-details-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_activities',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload) => {
          if (payload.new && (payload.new as any).activity_type === 'details_updated') {
            setHasDetailsChanged(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  return { hasDetailsChanged, loading };
};
