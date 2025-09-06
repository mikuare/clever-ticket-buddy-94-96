
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { ReferralNotification } from '@/types/referral';

interface ReferralNotificationCardProps {
  notification: ReferralNotification;
  isPending: boolean;
  onClick: () => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'declined': return <XCircle className="w-4 h-4 text-red-500" />;
    case 'cancelled': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    default: return <Clock className="w-4 h-4 text-blue-500" />;
  }
};

const ReferralNotificationCard = ({ notification, isPending, onClick }: ReferralNotificationCardProps) => {
  return (
    <Card 
      className={`${
        isPending 
          ? 'border-orange-200 bg-orange-50 cursor-pointer hover:bg-orange-100' 
          : 'opacity-75'
      }`}
      onClick={isPending ? onClick : undefined}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isPending ? (
                <Badge className="bg-orange-500 text-white text-xs">
                  PENDING APPROVAL
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  {notification.status}
                </Badge>
              )}
              <span className="text-sm font-medium">
                {notification.ticket.ticket_number}
              </span>
            </div>
            <p className={`text-sm ${isPending ? 'font-medium' : ''} mb-1`}>
              {notification.ticket.title}
            </p>
            <p className="text-xs text-gray-600 mb-1">
              Referred by: {notification.referring_admin.full_name}
            </p>
            {notification.status === 'accepted' && notification.responded_at && (
              <div className="text-xs text-green-600 font-medium mb-1 bg-green-50 px-2 py-1 rounded">
                ✓ Accepted by {notification.referred_admin?.full_name || 'Admin'} at {' '}
                {new Date(notification.responded_at).toLocaleString()}
              </div>
            )}
            <p className="text-xs text-gray-500">
              Referred: {new Date(notification.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isPending ? (
              <Clock className="w-4 h-4 text-orange-500" />
            ) : (
              getStatusIcon(notification.status)
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralNotificationCard;
