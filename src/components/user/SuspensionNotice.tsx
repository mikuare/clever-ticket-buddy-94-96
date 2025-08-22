
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Ban, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface SuspensionNoticeProps {
  onContinue: () => void;
}

const SuspensionNotice = ({ onContinue }: SuspensionNoticeProps) => {
  const { profile, signOut } = useAuth();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200 bg-red-50">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Ban className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-red-800 flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Account Suspended
          </CardTitle>
          <CardDescription className="text-red-700">
            Your account has been temporarily suspended
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              Hello <strong>{profile?.full_name}</strong>, your account has been suspended and you cannot create new tickets at this time.
            </p>
            
            {profile?.suspension_reason && (
              <div className="bg-white p-3 rounded-lg border border-red-200 mb-4">
                <p className="text-sm font-medium text-red-800 mb-2">Reason for suspension:</p>
                <p className="text-sm text-red-700">{profile.suspension_reason}</p>
              </div>
            )}
            
            {profile?.suspended_at && (
              <p className="text-xs text-gray-600 mb-4">
                Suspended on: {formatDate(profile.suspended_at)}
              </p>
            )}
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
              <p className="text-sm text-blue-800 mb-3">
                You can still view your dashboard and previously submitted tickets, but creating new tickets is disabled until your suspension is lifted.
              </p>
              <p className="text-sm text-blue-800">
                Please contact your department administrator to discuss the suspension and request reinstatement of your account.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 pt-4 border-t border-red-200">
            <Button 
              onClick={onContinue}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue to Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={signOut}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuspensionNotice;
