import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MaintenanceStatus {
  inMaintenance: boolean;
  maintenanceTitle: string;
  maintenanceDescription: string | null;
  maintenanceEndTime: string | null;
}

interface MaintenanceSession {
  id: string;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  is_immediate: boolean;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useMaintenanceMode = () => {
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus>({
    inMaintenance: false,
    maintenanceTitle: '',
    maintenanceDescription: null,
    maintenanceEndTime: null,
  });
  const [sessions, setSessions] = useState<MaintenanceSession[]>([]);
  const [loading, setLoading] = useState(true);

  const checkMaintenanceStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('is_system_in_maintenance');
      
      if (error) {
        console.error('Error checking maintenance status:', error);
        return;
      }

      if (data && data.length > 0) {
        const status = data[0];
        setMaintenanceStatus({
          inMaintenance: status.in_maintenance || false,
          maintenanceTitle: status.maintenance_title || 'System Under Maintenance',
          maintenanceDescription: status.maintenance_description,
          maintenanceEndTime: status.maintenance_end_time,
        });
      }
    } catch (error) {
      console.error('Error checking maintenance status:', error);
    }
  };

  const fetchMaintenanceSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_sessions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching maintenance sessions:', error);
        return;
      }

      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching maintenance sessions:', error);
    }
  };

  const enableImmediateMaintenance = async (title: string = 'System Under Maintenance', description?: string) => {
    try {
      const { data, error } = await supabase.rpc('enable_immediate_maintenance', {
        p_title: title,
        p_description: description,
      });

      if (error) throw error;

      toast({
        title: "Maintenance Mode Enabled",
        description: "Immediate maintenance mode has been activated.",
      });

      await Promise.all([checkMaintenanceStatus(), fetchMaintenanceSessions()]);
      return data;
    } catch (error) {
      console.error('Error enabling immediate maintenance:', error);
      toast({
        title: "Error",
        description: "Failed to enable maintenance mode.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const disableImmediateMaintenance = async () => {
    try {
      const { data, error } = await supabase.rpc('disable_immediate_maintenance');

      if (error) throw error;

      toast({
        title: "Maintenance Mode Disabled",
        description: "Immediate maintenance mode has been disabled.",
      });

      await Promise.all([checkMaintenanceStatus(), fetchMaintenanceSessions()]);
      return data;
    } catch (error) {
      console.error('Error disabling immediate maintenance:', error);
      toast({
        title: "Error",
        description: "Failed to disable maintenance mode.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const scheduleMaintenanceSession = async (
    title: string,
    startTime: Date,
    endTime?: Date,
    description?: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('schedule_maintenance_session', {
        p_title: title,
        p_start_time: startTime.toISOString(),
        p_end_time: endTime?.toISOString() || null,
        p_description: description,
      });

      if (error) throw error;

      toast({
        title: "Maintenance Scheduled",
        description: "Maintenance session has been scheduled successfully.",
      });

      await Promise.all([checkMaintenanceStatus(), fetchMaintenanceSessions()]);
      return data;
    } catch (error) {
      console.error('Error scheduling maintenance session:', error);
      toast({
        title: "Error",
        description: "Failed to schedule maintenance session.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const cancelMaintenanceSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Maintenance Cancelled",
        description: "Maintenance session has been cancelled.",
      });

      await Promise.all([checkMaintenanceStatus(), fetchMaintenanceSessions()]);
    } catch (error) {
      console.error('Error cancelling maintenance session:', error);
      toast({
        title: "Error",
        description: "Failed to cancel maintenance session.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await Promise.all([checkMaintenanceStatus(), fetchMaintenanceSessions()]);
      setLoading(false);
    };

    initialize();

    // Set up real-time subscription for maintenance sessions
    const subscription = supabase
      .channel('maintenance_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_sessions',
        },
        () => {
          checkMaintenanceStatus();
          fetchMaintenanceSessions();
        }
      )
      .subscribe();

    // Periodically check for expired maintenance sessions
    const interval = setInterval(() => {
      checkMaintenanceStatus();
    }, 30000); // Check every 30 seconds

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return {
    maintenanceStatus,
    sessions,
    loading,
    enableImmediateMaintenance,
    disableImmediateMaintenance,
    scheduleMaintenanceSession,
    cancelMaintenanceSession,
    checkMaintenanceStatus,
    refreshSessions: fetchMaintenanceSessions,
  };
};