
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TicketActivity, TicketCreator } from './types';
import type { Ticket } from '@/types/admin';

export const useTicketProgression = (ticket: Ticket | null, isOpen: boolean) => {
  const [activities, setActivities] = useState<TicketActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [ticketCreator, setTicketCreator] = useState<TicketCreator | null>(null);

  const fetchTicketCreator = async (userId: string): Promise<TicketCreator | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, department_code')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching ticket creator:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching ticket creator:', error);
      return null;
    }
  };

  const removeDuplicateActivities = (activities: TicketActivity[]): TicketActivity[] => {
    const seen = new Set<string>();
    const uniqueActivities: TicketActivity[] = [];

    // Sort activities by created_at to ensure chronological order
    const sortedActivities = [...activities].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    for (const activity of sortedActivities) {
      // Create a unique key based on activity type, user, and time
      const timestamp = new Date(activity.created_at).getTime();
      const timeWindow = Math.floor(timestamp / 5000) * 5000; // 5-second window
      const uniqueKey = `${activity.activity_type}-${activity.user_id}-${timeWindow}`;

      // For specific activity types, use more specific keys to avoid over-deduplication
      let finalKey = uniqueKey;
      
      if (activity.activity_type === 'status_changed') {
        finalKey = `${activity.activity_type}-${activity.user_id}-${activity.description}-${timeWindow}`;
      } else if (activity.activity_type === 'referred') {
        finalKey = `${activity.activity_type}-${activity.user_id}-${activity.description}-${timeWindow}`;
      } else if (activity.activity_type === 'details_updated') {
        // Always include details_updated activities - use exact timestamp and ID
        finalKey = `${activity.activity_type}-${activity.user_id}-${activity.id}-${timestamp}`;
        console.log('Processing details_updated activity with key:', finalKey, activity);
      }

      if (!seen.has(finalKey)) {
        seen.add(finalKey);
        uniqueActivities.push(activity);
        if (activity.activity_type === 'details_updated') {
          console.log('Added details_updated activity:', activity);
        }
      } else {
        console.log('Removing duplicate activity:', activity);
      }
    }

    return uniqueActivities;
  };

  const fetchTicketActivities = async () => {
    if (!ticket?.id) return;

    setLoading(true);
    try {
      console.log('Fetching activities for ticket:', ticket.id);
      
      const { data, error } = await supabase
        .from('ticket_activities')
        .select('*')
        .eq('ticket_id', ticket.id)
        .in('activity_type', [
          'created',
          'assigned', 
          'referred',
          'referral_accepted',
          'referral_declined',
          'resolved',
          'closed',
          'status_changed',
          'details_updated',
          'escalated_to_infosoft',
          'escalation_resolved'
        ])
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching ticket activities:', error);
        throw error;
      }

      console.log('Raw fetched activities:', data);
      console.log('Details updated activities found:', data?.filter(a => a.activity_type === 'details_updated') || []);
      
      // Remove duplicates using improved logic
      const uniqueActivities = removeDuplicateActivities(data || []);
      
      console.log('Unique activities after deduplication:', uniqueActivities);
      console.log('Final details updated activities:', uniqueActivities.filter(a => a.activity_type === 'details_updated'));
      
      setActivities(uniqueActivities);

      // Fetch ticket creator information
      if (ticket.user_id) {
        const creatorData = await fetchTicketCreator(ticket.user_id);
        setTicketCreator(creatorData);
      }
    } catch (error) {
      console.error('Error loading ticket progression:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && ticket) {
      fetchTicketActivities();

      // Set up real-time subscription for activity updates
      const channel = supabase
        .channel(`ticket-activities-${ticket.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ticket_activities',
            filter: `ticket_id=eq.${ticket.id}`
          },
          (payload) => {
            console.log('Activity updated via real-time, refetching...', payload);
            // Add a small delay to ensure the database transaction is complete
            setTimeout(() => {
              fetchTicketActivities();
            }, 500);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, ticket?.id]);

  return {
    activities,
    loading,
    ticketCreator
  };
};
