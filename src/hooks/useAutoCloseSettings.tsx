import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAutoCloseSettings = () => {
  const [autoCloseHours, setAutoCloseHours] = useState<number>(24);
  const [loading, setLoading] = useState(true);

  const fetchAutoCloseSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'auto_close_hours')
        .single();

      if (error) {
        console.error('Error fetching auto-close settings:', error);
        console.error('This might be due to RLS policies. Using default value.');
        setAutoCloseHours(24); // Default fallback
        return;
      }

      if (data) {
        const hours = parseInt(data.setting_value);
        const newHours = isNaN(hours) ? 24 : hours;
        setAutoCloseHours(newHours);
        console.log('Auto-close hours loaded:', newHours, 'from database value:', data.setting_value);
      }
    } catch (error) {
      console.error('Error fetching auto-close settings:', error);
      setAutoCloseHours(24); // Default fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutoCloseSettings();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('system_settings_auto_close')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'system_settings',
        filter: 'setting_key=eq.auto_close_hours'
      }, (payload) => {
        console.log('Auto-close settings changed:', payload);
        if (payload.new && 'setting_value' in payload.new) {
          const hours = parseInt(payload.new.setting_value as string);
          const newHours = isNaN(hours) ? 24 : hours;
          setAutoCloseHours(newHours);
          console.log('Auto-close hours updated via realtime:', newHours, 'from payload:', payload.new.setting_value);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    autoCloseHours,
    loading,
    refreshSettings: fetchAutoCloseSettings
  };
};

export const useClassificationCooldownSettings = () => {
  const [cooldownMinutes, setCooldownMinutes] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const fetchCooldownSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'classification_cooldown_minutes')
        .single();

      if (error) {
        console.error('Error fetching cooldown settings:', error);
        console.error('This might be due to RLS policies. Using default value.');
        setCooldownMinutes(1); // Default fallback
        return;
      }

      if (data) {
        const minutes = parseInt(data.setting_value);
        const newMinutes = isNaN(minutes) ? 1 : minutes;
        setCooldownMinutes(newMinutes);
        console.log('Classification cooldown minutes loaded:', newMinutes, 'from database value:', data.setting_value);
      }
    } catch (error) {
      console.error('Error fetching cooldown settings:', error);
      setCooldownMinutes(1); // Default fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCooldownSettings();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('system_settings_cooldown')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'system_settings',
        filter: 'setting_key=eq.classification_cooldown_minutes'
      }, (payload) => {
        console.log('Classification cooldown settings changed:', payload);
        if (payload.new && 'setting_value' in payload.new) {
          const minutes = parseInt(payload.new.setting_value as string);
          const newMinutes = isNaN(minutes) ? 1 : minutes;
          setCooldownMinutes(newMinutes);
          console.log('Classification cooldown minutes updated via realtime:', newMinutes, 'from payload:', payload.new.setting_value);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    cooldownMinutes,
    loading,
    refreshSettings: fetchCooldownSettings
  };
};