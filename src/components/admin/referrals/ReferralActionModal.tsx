
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle } from 'lucide-react';
import type { ReferralNotification } from '@/types/referral';

interface ReferralActionModalProps {
  notification: ReferralNotification | null;
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  onAction: (referralId: string, action: 'accept' | 'decline') => void;
}

const ReferralActionModal = ({ 
  notification, 
  isOpen, 
  loading, 
  onClose, 
  onAction 
}: ReferralActionModalProps) => {
  if (!notification) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Referral Request</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{notification.ticket.ticket_number}</span>
                </div>
                <p className="text-sm">{notification.ticket.title}</p>
                <p className="text-xs text-gray-600">
                  Department: {notification.ticket.department_code}
                </p>
                <p className="text-xs text-gray-600">
                  Referred by: {notification.referring_admin.full_name}
                </p>
              </div>
            </CardContent>
          </Card>

          {notification.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Action Required:</strong> This ticket has been referred to you for handling. 
                Please review and decide whether to accept or decline this referral.
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                <strong>Note:</strong> If you decline, the ticket will be returned to {notification.referring_admin.full_name}.
              </p>
            </div>
          )}
        </div>

        {notification.status === 'pending' && (
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onAction(notification.id, 'decline')}
              disabled={loading}
              className="text-red-600 hover:text-red-700"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Decline & Return
            </Button>
            <Button 
              onClick={() => onAction(notification.id, 'accept')}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Accept
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReferralActionModal;
