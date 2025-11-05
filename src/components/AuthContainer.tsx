
import { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';
import ForgotPasswordPage from '@/components/ForgotPasswordPage';
import MaintenanceNotice from '@/components/shared/MaintenanceNotice';
import { useMaintenanceMode } from '@/hooks/useMaintenanceMode';

const AuthContainer = () => {
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'forgot-password' | 'admin-login'>('login');
  const { maintenanceStatus, loading: maintenanceLoading } = useMaintenanceMode();

  const handleShowSignup = () => setCurrentView('signup');
  const handleShowForgotPassword = () => setCurrentView('forgot-password');
  const handleBackToLogin = () => setCurrentView('login');
  const handleShowAdminLogin = () => setCurrentView('admin-login');

  // Show maintenance notice if system is in maintenance mode and user is not an admin
  if (maintenanceStatus.inMaintenance && !maintenanceLoading) {
    return (
      <MaintenanceNotice 
        onAdminLogin={handleShowAdminLogin}
        showAdminLogin={currentView === 'admin-login'}
        onBackToMaintenance={handleBackToLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'signup' ? (
        <SignupForm onBackToLogin={handleBackToLogin} />
      ) : currentView === 'forgot-password' ? (
        <ForgotPasswordPage onBackToLogin={handleBackToLogin} />
      ) : currentView === 'admin-login' ? (
        <LoginForm 
          onShowSignup={handleShowSignup} 
          onShowForgotPassword={handleShowForgotPassword}
          isAdminLoginDuringMaintenance={true}
        />
      ) : (
        <LoginForm 
          onShowSignup={handleShowSignup} 
          onShowForgotPassword={handleShowForgotPassword}
        />
      )}
    </div>
  );
};

export default AuthContainer;
