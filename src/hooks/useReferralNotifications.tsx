
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ReferralService } from '@/services/referralService';
import type { ReferralNotification } from '@/types/referral';

export const useReferralNotifications = ({ adminId }: { adminId: string }) => {
  const [notifications, setNotifications] = useState<ReferralNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReferralNotifications = async () => {
    if (!adminId) return;
    
    try {
      setLoading(true);
      const data = await ReferralService.fetchReferralNotifications(adminId);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching referral notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralNotifications();
    
    // Set up real-time subscription for referral changes
    if (adminId) {
      const channel = supabase
        .channel(`referral-notifications-${adminId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ticket_referrals',
            filter: `referred_admin_id=eq.${adminId}`
          },
          () => {
            // Refresh notifications when any referral change occurs
            fetchReferralNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [adminId]);

  return {
    notifications,
    loading,
    fetchReferralNotifications
  };
};
