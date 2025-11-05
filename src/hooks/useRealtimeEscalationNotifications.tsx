import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWebNotifications } from '@/hooks/useWebNotifications';

export const useRealtimeEscalationNotifications = (isAdmin: boolean, profile: any) => {
  const { toast } = useToast();
  const { showNotification } = useWebNotifications();
  const [escalationCount, setEscalationCount] = useState(0);

  useEffect(() => {
    if (!isAdmin || !profile?.id) return;

    let mounted = true;
    
    // Initial count of escalated tickets
    const loadInitialEscalations = async () => {
      try {
        const { data } = await supabase.rpc('get_escalated_tickets');
        if (mounted && data) {
          setEscalationCount(data.length);
        }
      } catch (error) {
        console.error('Error loading escalations:', error);
      }
    };

    loadInitialEscalations();

    // Real-time subscription for escalations
    const channel = supabase
      .channel('admin-escalation-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'infosoft_escalations'
        },
        (payload) => {
          if (!mounted) return;
          
          console.log('New escalation created:', payload);
          setEscalationCount(prev => prev + 1);
          
          toast({
            title: "🚨 Ticket Escalated to Infosoft Dev",
            description: `A ticket has been escalated and requires developer attention`,
            duration: 8000,
          });

          // Show web notification
          showNotification({
            title: "🚨 Ticket Escalated to Infosoft Dev",
            body: `A ticket has been escalated and requires developer attention`,
            tag: `escalation-new`,
            requireInteraction: true,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'infosoft_escalations'
        },
        (payload) => {
          if (!mounted) return;
          
          if (payload.old.status === 'escalated' && payload.new.status === 'resolved') {
            console.log('Escalation resolved:', payload);
            setEscalationCount(prev => Math.max(0, prev - 1));
            
            toast({
              title: "✅ Escalation Resolved",
              description: `An escalated ticket has been resolved`,
              duration: 5000,
            });

            // Show web notification
            showNotification({
              title: "✅ Escalation Resolved",
              body: `An escalated ticket has been resolved`,
              tag: `escalation-resolved`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [isAdmin, profile?.id, toast]);

  return { escalationCount };
};