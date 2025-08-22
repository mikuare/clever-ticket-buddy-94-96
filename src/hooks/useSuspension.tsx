
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SuspendUserParams {
  userId: string;
  reason: string;
}

export const useSuspension = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const suspendUser = async ({ userId, reason }: SuspendUserParams) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('manage_user_suspension', {
        p_user_id: userId,
        p_suspend: true,
        p_reason: reason
      });

      if (error) throw error;

      toast({
        title: "User Suspended",
        description: "The user has been suspended successfully.",
      });

      return true;
    } catch (error: any) {
      console.error('Error suspending user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to suspend user",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unsuspendUser = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('manage_user_suspension', {
        p_user_id: userId,
        p_suspend: false
      });

      if (error) throw error;

      toast({
        title: "User Unsuspended",
        description: "The user has been unsuspended successfully.",
      });

      return true;
    } catch (error: any) {
      console.error('Error unsuspending user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to unsuspend user",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    suspendUser,
    unsuspendUser,
    loading
  };
};
