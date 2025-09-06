
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMaintenanceMode } from '@/hooks/useMaintenanceMode';
import { useIdleTimer } from '@/hooks/useIdleTimer';
import AdminDashboard from '@/components/AdminDashboard';
import UserDashboard from '@/components/UserDashboard';
import SuspensionNotice from '@/components/user/SuspensionNotice';
import MaintenanceNotice from '@/components/shared/MaintenanceNotice';
import AuthContainer from '@/components/AuthContainer';
import { AuthProvider } from '@/hooks/useAuth';

const IndexPage = () => {
  const { user, profile, loading, showSuspensionNotice, setShowSuspensionNotice } = useAuth();
  const { maintenanceStatus, loading: maintenanceLoading } = useMaintenanceMode();
  const navigate = useNavigate();

  // Auto-logout for inactive users (1 hour idle, 2 minutes warning)
  useIdleTimer({
    idleTime: 60 * 60 * 1000, // 1 hour
    warningTime: 2 * 60 * 1000  // 2 minutes warning before logout
  });

  useEffect(() => {
    // Check if this is a password reset redirect from Supabase
    const checkPasswordResetRedirect = () => {
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check for password reset indicators in URL
      const hasResetToken = hash.includes('access_token') && hash.includes('refresh_token') && hash.includes('type=recovery');
      const isPasswordReset = urlParams.get('type') === 'recovery';
      
      if (hasResetToken || isPasswordReset) {
        console.log('Password reset redirect detected, navigating to reset-password page');
        // Redirect to reset password page with the current URL params and hash
        navigate('/reset-password' + window.location.search + window.location.hash);
        return true;
      }
      return false;
    };

    // Only check for password reset if we're not already loading and don't have a user
    if (!loading && !user) {
      checkPasswordResetRedirect();
    }
  }, [loading, user, navigate]);

  if (loading || maintenanceLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthContainer />;
  }

  // Check maintenance mode for non-admin users
  if (maintenanceStatus.inMaintenance && !profile?.is_admin) {
    return <MaintenanceNotice />;
  }

  // Show suspension notice if user is suspended and hasn't clicked continue
  if (profile?.is_suspended && showSuspensionNotice) {
    return (
      <SuspensionNotice 
        onContinue={() => setShowSuspensionNotice(false)} 
      />
    );
  }

  if (profile?.is_admin) {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
};

const Index = () => {
  return (
    <AuthProvider>
      <IndexPage />
    </AuthProvider>
  );
};

export default Index;
