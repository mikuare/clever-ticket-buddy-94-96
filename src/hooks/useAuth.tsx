import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  department_code: string;
  is_admin: boolean;
  avatar_url?: string;
  mobile_number?: string;
  social_media_links?: SocialMediaLinks;
  show_on_main_page?: boolean;
  is_suspended: boolean;
  suspended_at?: string;
  suspended_by?: string;
  suspension_reason?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  showSuspensionNotice: boolean;
  setShowSuspensionNotice: (show: boolean) => void;
  signUp: (email: string, password: string, fullName: string, departmentCode: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuspensionNotice, setShowSuspensionNotice] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (!mounted) return;

      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Use setTimeout to prevent deadlock
        setTimeout(() => {
          if (mounted) {
            fetchProfile(session.user.id);
          }
        }, 0);
      } else {
        setProfile(null);
        setShowSuspensionNotice(false);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      // Safely cast Json to SocialMediaLinks and include suspension fields
      const typedProfile: Profile = {
        ...data,
        social_media_links: data.social_media_links as SocialMediaLinks || {},
        is_suspended: data.is_suspended || false,
        suspended_at: data.suspended_at,
        suspended_by: data.suspended_by,
        suspension_reason: data.suspension_reason
      };
      
      setProfile(typedProfile);
      
      // Show suspension notice if user is suspended (only on first load)
      if (typedProfile.is_suspended && !showSuspensionNotice) {
        setShowSuspensionNotice(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, departmentCode: string) => {
    // Use the production Vercel URL for email redirects
    const isProduction = window.location.hostname.includes('vercel.app');
    const redirectUrl = isProduction 
      ? 'https://help-desk-qmaz-v1-iota.vercel.app/'
      : `${window.location.origin}/`;
    
    console.log('Signup redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          department_code: departmentCode,
        },
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const refreshProfile = async () => {
    if (!user?.id) {
      return;
    }

    await fetchProfile(user.id);
  };

  const signOut = async () => {
    try {
      console.log('useAuth: Starting enhanced sign out process...');
      
      // Enhanced cleanup for all auth-related storage
      const cleanupAuthState = () => {
        console.log('useAuth: Performing comprehensive auth state cleanup...');
        
        // Clear all possible Supabase auth keys
        const keysToRemove = [
          'supabase.auth.token',
          'supabase.auth.session',
          'supabase.auth.user'
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
        
        // Clear all keys that start with supabase auth patterns
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-emrbosuzmtgyashgxeum') || key.includes('sb-')) {
            localStorage.removeItem(key);
            console.log(`useAuth: Removed localStorage key: ${key}`);
          }
        });
        
        Object.keys(sessionStorage || {}).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-emrbosuzmtgyashgxeum') || key.includes('sb-')) {
            sessionStorage.removeItem(key);
            console.log(`useAuth: Removed sessionStorage key: ${key}`);
          }
        });
      };

      // Cleanup first
      cleanupAuthState();
      
      // Clear local state immediately
      setUser(null);
      setProfile(null);
      setShowSuspensionNotice(false);
      
      // Attempt Supabase sign out with enhanced error handling
      try {
        console.log('useAuth: Attempting Supabase global sign out...');
        const { error } = await supabase.auth.signOut({ scope: 'global' });
        
        if (error) {
          console.error('useAuth: Supabase sign out error (continuing cleanup):', error);
        } else {
          console.log('useAuth: Supabase sign out successful');
        }
      } catch (supabaseError) {
        console.error('useAuth: Supabase sign out failed (continuing cleanup):', supabaseError);
      }
      
      // Final cleanup after sign out attempt
      cleanupAuthState();
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out safely.",
      });
      
      console.log('useAuth: Sign out completed successfully');
      
    } catch (error) {
      console.error('useAuth: Unexpected sign out error:', error);
      
      // Even on error, force cleanup and state reset
      setUser(null);
      setProfile(null);
      setShowSuspensionNotice(false);
      
      // Final emergency cleanup
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
      } catch (cleanupError) {
        console.error('useAuth: Cleanup error:', cleanupError);
      }
      
      toast({
        title: "Signed out",
        description: "Session cleared successfully.",
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      showSuspensionNotice,
      setShowSuspensionNotice,
      signUp,
      signIn,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
