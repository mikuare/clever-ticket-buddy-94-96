
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  user_id: string;
  department_code: string;
  assigned_admin_id?: string | null;
  assigned_admin_name?: string | null;
  attachments: Json;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  admin_resolved_at?: string | null;
  user_closed_at?: string | null;
  resolution_notes?: Json | null;
}

export const useUserTickets = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [classificationCooldowns, setClassificationCooldowns] = useState<Map<string, boolean>>(new Map());

  const fetchTickets = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkClassificationCooldowns = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_cooldowns')
        .select('classification, last_ticket_time')
        .eq('user_id', profile.id);

      if (error) throw error;

      const cooldownMap = new Map<string, boolean>();
      const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);

      if (data) {
        data.forEach(cooldown => {
          const lastTime = new Date(cooldown.last_ticket_time);
          const isOnCooldown = lastTime > oneMinuteAgo;
          cooldownMap.set(cooldown.classification, isOnCooldown);
        });
      }

      setClassificationCooldowns(cooldownMap);
    } catch (error) {
      console.error('Error checking cooldowns:', error);
      // On error, allow ticket creation
      setClassificationCooldowns(new Map());
    }
  };

  const canCreateTicketForClassification = (classification: string) => {
    return !classificationCooldowns.get(classification);
  };

  useEffect(() => {
    if (profile?.id) {
      fetchTickets();
      checkClassificationCooldowns();
    }
  }, [profile?.id]);

  const handleTicketCreated = (classification: string) => {
    // Update the cooldown for this specific classification
    setClassificationCooldowns(prev => new Map(prev.set(classification, true)));
    fetchTickets();
  };

  return {
    tickets,
    loading,
    classificationCooldowns,
    canCreateTicketForClassification,
    fetchTickets,
    handleTicketCreated,
    checkClassificationCooldowns
  };
};
