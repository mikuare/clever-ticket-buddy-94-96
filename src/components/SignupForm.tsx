
import BrandingPanel from './auth/BrandingPanel';
import SignupFormContent from './auth/SignupFormContent';
import { useIsMobile } from '@/hooks/use-mobile';

interface SignupFormProps {
  onBackToLogin: () => void;
}

const SignupForm = ({ onBackToLogin }: SignupFormProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <SignupFormContent onBackToLogin={onBackToLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-[70%]">
        <BrandingPanel />
      </div>
      <div className="w-[30%]">
        <SignupFormContent onBackToLogin={onBackToLogin} />
      </div>
    </div>
  );
};

export default SignupForm;
