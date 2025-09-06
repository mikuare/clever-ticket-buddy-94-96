import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useReferralNotifications } from '@/hooks/useReferralNotifications';
import { useReferralActions } from '@/hooks/useReferralActions';
import ReferralNotificationCard from '@/components/admin/referrals/ReferralNotificationCard';
import ReferralActionModal from '@/components/admin/referrals/ReferralActionModal';
import type { ReferralNotification } from '@/types/referral';

interface ReferralNotificationsProps {
  adminId: string;
  onNotificationUpdate: () => void;
}

const ReferralNotifications = ({ adminId, onNotificationUpdate }: ReferralNotificationsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<ReferralNotification | null>(null);
  
  const { notifications, fetchReferralNotifications } = useReferralNotifications({ adminId });
  const { loading, handleReferralAction } = useReferralActions({
    adminId,
    onNotificationUpdate,
    onRefreshNotifications: fetchReferralNotifications
  });

  const pendingNotifications = notifications.filter(n => n.status === 'pending');
  const otherNotifications = notifications.filter(n => n.status !== 'pending');

  const handleNotificationClick = (notification: ReferralNotification) => {
    setSelectedNotification(notification);
    setShowModal(true);
  };

  const handleModalAction = async (referralId: string, action: 'accept' | 'decline') => {
    if (!selectedNotification) return;
    
    // Convert action to the format expected by handleReferralAction
    const actionStatus = action === 'accept' ? 'accepted' : 'declined';
    await handleReferralAction(referralId, actionStatus, selectedNotification);
    setShowModal(false);
    setSelectedNotification(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedNotification(null);
  };

  if (notifications.length === 0) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="fixed bottom-6 right-[156px] z-50 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 group">
            <Bell className="w-6 h-6" />
            {pendingNotifications.length > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {pendingNotifications.length}
              </div>
            )}
            <div className="absolute bottom-full right-0 mb-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Referral Notifications
            </div>
          </div>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Referral Notifications
              {pendingNotifications.length > 0 && (
                <Badge className="bg-red-500 text-white">
                  {pendingNotifications.length} pending
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Tickets referred to you by other admins
            </p>
            
            <div className="space-y-3">
              {/* Pending notifications first */}
              {pendingNotifications.map((notification) => (
                <ReferralNotificationCard
                  key={notification.id}
                  notification={notification}
                  isPending={true}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))}

              {/* Other notifications */}
              {otherNotifications.map((notification) => (
                <ReferralNotificationCard
                  key={notification.id}
                  notification={notification}
                  isPending={false}
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ReferralActionModal
        notification={selectedNotification}
        isOpen={showModal}
        loading={loading}
        onClose={handleModalClose}
        onAction={handleModalAction}
      />
    </>
  );
};

export default ReferralNotifications;
