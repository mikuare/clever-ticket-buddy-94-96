
import { useState, useEffect } from 'react';

// Cache escalation status to prevent excessive API calls
const escalationCache = new Map<string, boolean>();
const cacheExpiry = new Map<string, number>();
const CACHE_DURATION = 30000; // 30 seconds

export const useTicketEscalation = (ticketId: string) => {
  const [isEscalated, setIsEscalated] = useState(false);

  useEffect(() => {
    const checkEscalationStatus = async () => {
      try {
        // Check cache first
        const now = Date.now();
        const cached = escalationCache.get(ticketId);
        const expiry = cacheExpiry.get(ticketId);
        
        if (cached !== undefined && expiry && now < expiry) {
          setIsEscalated(cached);
          return;
        }

        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
          .from('infosoft_escalations')
          .select('id')
          .eq('ticket_id', ticketId)
          .eq('status', 'escalated')
          .single();

        const escalated = !error && !!data;
        
        // Cache the result
        escalationCache.set(ticketId, escalated);
        cacheExpiry.set(ticketId, now + CACHE_DURATION);
        
        setIsEscalated(escalated);
      } catch (error) {
        console.error('Error checking escalation status:', error);
      }
    };

    if (ticketId) {
      checkEscalationStatus();
    }
  }, [ticketId]);

  return { isEscalated };
};
