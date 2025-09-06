
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AutoCloseService = () => {
  useEffect(() => {
    // Run auto-close check immediately and then every hour (since we now use 24 hours)
    const runAutoClose = async () => {
      try {
        const { error } = await supabase.rpc('auto_close_resolved_tickets');
        if (error) {
          console.error('Error running auto-close:', error);
        }
      } catch (error) {
        console.error('Error calling auto-close function:', error);
      }
    };

    // Run immediately
    runAutoClose();

    // Set up interval to run every hour instead of every minute
    const interval = setInterval(runAutoClose, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null; // This component doesn't render anything
};

export default AutoCloseService;
