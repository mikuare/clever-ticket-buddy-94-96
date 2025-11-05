import { useMaintenanceMode } from '@/hooks/useMaintenanceMode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Settings } from 'lucide-react';
import { format } from 'date-fns';
import LoginForm from '@/components/LoginForm';

interface MaintenanceNoticeProps {
  onAdminLogin?: () => void;
  showAdminLogin?: boolean;
  onBackToMaintenance?: () => void;
}

const MaintenanceNotice = ({ onAdminLogin, showAdminLogin = false, onBackToMaintenance }: MaintenanceNoticeProps) => {
  const { maintenanceStatus, loading } = useMaintenanceMode();

  if (loading || !maintenanceStatus.inMaintenance) {
    return null;
  }

  // Show admin login form during maintenance
  if (showAdminLogin) {
    return (
      <LoginForm 
        onShowSignup={() => {}}
        onShowForgotPassword={() => {}}
        isAdminLoginDuringMaintenance={true}
        maintenanceMessage={{
          title: maintenanceStatus.maintenanceTitle,
          description: maintenanceStatus.maintenanceDescription
        }}
      />
    );
  }

  const formatEndTime = (dateString: string | null) => {
    if (!dateString) return null;
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {maintenanceStatus.maintenanceTitle}
          </CardTitle>
          <CardDescription className="text-base">
            The system is currently undergoing maintenance
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {maintenanceStatus.maintenanceDescription && (
            <p className="text-gray-600 leading-relaxed">
              {maintenanceStatus.maintenanceDescription}
            </p>
          )}
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 font-medium">
              We apologize for any inconvenience. Please try again later.
            </p>
          </div>

          {maintenanceStatus.maintenanceEndTime && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>
                Expected completion: {formatEndTime(maintenanceStatus.maintenanceEndTime)}
              </span>
            </div>
          )}

          <div className="pt-4 space-y-3">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Maintenance Mode Active
            </Badge>
            
            {onAdminLogin && (
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  onClick={onAdminLogin}
                  className="w-full flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Admin Login
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceNotice;