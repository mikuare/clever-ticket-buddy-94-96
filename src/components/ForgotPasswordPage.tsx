
import BrandingPanel from './auth/BrandingPanel';
import ForgotPasswordForm from './auth/ForgotPasswordForm';
import { useIsMobile } from '@/hooks/use-mobile';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}

const ForgotPasswordPage = ({ onBackToLogin }: ForgotPasswordPageProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <ForgotPasswordForm onBackToLogin={onBackToLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-[70%]">
        <BrandingPanel />
      </div>
      
      {/* Right Panel - Forgot Password Form */}
      <div className="w-[30%] flex items-center justify-center p-8 bg-gray-50">
        <ForgotPasswordForm onBackToLogin={onBackToLogin} />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
