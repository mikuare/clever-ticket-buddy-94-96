
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ReferralService } from '@/services/referralService';

export const useTicketReferrals = (adminId: string) => {
  const { toast } = useToast();
  const [canReferTickets, setCanReferTickets] = useState<Map<string, boolean>>(new Map());
  const [referralTimeouts, setReferralTimeouts] = useState<Map<string, NodeJS.Timeout>>(new Map());

  // Enable referral option when ticket details are viewed (but check if ticket can be referred)
  const enableReferralForTicket = async (ticketId: string) => {
    console.log(`Checking if ticket ${ticketId} can be referred...`);
    
    // Check if the ticket can be referred (not resolved or closed)
    const canRefer = await ReferralService.canReferTicket(ticketId);
    
    if (!canRefer) {
      console.log(`Ticket ${ticketId} cannot be referred - ticket is resolved or closed`);
      return;
    }
    
    console.log(`Enabling referral for ticket ${ticketId}`);
    setCanReferTickets(prev => new Map(prev).set(ticketId, true));
    
    // Clear existing timeout if any
    const existingTimeout = referralTimeouts.get(ticketId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Set 5-minute timeout
    const timeout = setTimeout(() => {
      console.log(`Referral timeout expired for ticket ${ticketId}`);
      setCanReferTickets(prev => {
        const newMap = new Map(prev);
        newMap.delete(ticketId);
        return newMap;
      });
      setReferralTimeouts(prev => {
        const newMap = new Map(prev);
        newMap.delete(ticketId);
        return newMap;
      });
    }, 5 * 60 * 1000); // 5 minutes

    setReferralTimeouts(prev => new Map(prev).set(ticketId, timeout));
  };

  // Check if ticket can be referred
  const canReferTicket = (ticketId: string) => {
    return canReferTickets.get(ticketId) || false;
  };

  // Get pending referral notifications count
  const [pendingReferralsCount, setPendingReferralsCount] = useState(0);

  useEffect(() => {
    const fetchPendingReferrals = async () => {
      try {
        const { data, error } = await supabase
          .from('ticket_referrals')
          .select('id')
          .eq('referred_admin_id', adminId)
          .eq('status', 'pending');

        if (error) throw error;
        setPendingReferralsCount(data?.length || 0);
      } catch (error) {
        console.error('Error fetching pending referrals:', error);
      }
    };

    if (adminId) {
      fetchPendingReferrals();
      
      // Set up real-time subscription
      const channel = supabase
        .channel(`pending-referrals-${adminId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ticket_referrals',
            filter: `referred_admin_id=eq.${adminId}`
          },
          () => {
            fetchPendingReferrals();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [adminId]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      referralTimeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return {
    enableReferralForTicket,
    canReferTicket,
    pendingReferralsCount
  };
};
