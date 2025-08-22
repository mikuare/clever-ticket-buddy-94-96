import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRealtimeReferralNotifications = (isAdmin: boolean, profile: any) => {
  const { toast } = useToast();
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    if (!isAdmin || !profile?.id) return;

    let mounted = true;
    
    // Initial count of pending referrals for this admin
    const loadInitialReferrals = async () => {
      try {
        const { data } = await supabase
          .from('ticket_referrals')
          .select('*')
          .eq('referred_admin_id', profile.id)
          .eq('status', 'pending');
          
        if (mounted && data) {
          setReferralCount(data.length);
        }
      } catch (error) {
        console.error('Error loading referrals:', error);
      }
    };

    loadInitialReferrals();

    // Real-time subscription for referrals
    const channel = supabase
      .channel('admin-referral-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_referrals'
        },
        async (payload) => {
          if (!mounted) return;
          
          const referral = payload.new as any;
          
          // Only notify if this admin is the one being referred to
          if (referral.referred_admin_id === profile.id) {
            console.log('New referral received:', referral);
            setReferralCount(prev => prev + 1);
            
            // Get ticket and referring admin details
            const { data: ticket } = await supabase
              .from('tickets')
              .select('ticket_number, title')
              .eq('id', referral.ticket_id)
              .single();
              
            const { data: referringAdmin } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', referral.referring_admin_id)
              .single();
            
            toast({
              title: "📨 New Ticket Referral",
              description: `${referringAdmin?.full_name || 'An admin'} referred ticket ${ticket?.ticket_number || ''} to you`,
              duration: 8000,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ticket_referrals'
        },
        (payload) => {
          if (!mounted) return;
          
          const referral = payload.new as any;
          const oldReferral = payload.old as any;
          
          // Update count if referral status changed for this admin
          if (referral.referred_admin_id === profile.id) {
            if (oldReferral.status === 'pending' && referral.status !== 'pending') {
              setReferralCount(prev => Math.max(0, prev - 1));
            } else if (oldReferral.status !== 'pending' && referral.status === 'pending') {
              setReferralCount(prev => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [isAdmin, profile?.id, toast]);

  return { referralCount };
};