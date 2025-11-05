
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAuth = () => {
  const { user, profile, loading } = useAuth();
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (!loading && user && profile) {
        console.log('Verifying admin status for user:', user.id);
        console.log('Profile data:', profile);
        
        try {
          // Double-check admin status from database
          const { data: adminProfile, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error verifying admin status:', error);
            setIsAdmin(false);
          } else {
            console.log('Admin verification result:', adminProfile);
            setIsAdmin(adminProfile?.is_admin === true);
          }
        } catch (error) {
          console.error('Admin verification failed:', error);
          setIsAdmin(false);
        }
      } else if (!loading && (!user || !profile)) {
        setIsAdmin(false);
      }
      
      setIsVerifyingAdmin(false);
    };

    verifyAdminStatus();
  }, [user, profile, loading]);

  return {
    isAdmin,
    isVerifyingAdmin: loading || isVerifyingAdmin,
    user,
    profile
  };
};
