
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface AccessDeniedProps {
  onSignOut: () => void;
}

const AccessDenied = ({ onSignOut }: AccessDeniedProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-4">You don't have permission to access the admin dashboard.</p>
        <Button onClick={onSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AccessDenied;
