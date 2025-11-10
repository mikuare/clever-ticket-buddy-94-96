
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ReferralService } from '@/services/referralService';
import type { ReferralNotification } from '@/types/referral';

interface UseReferralActionsProps {
  adminId: string;
  onNotificationUpdate: () => void;
  onRefreshNotifications: () => void;
}

export const useReferralActions = ({ 
  adminId, 
  onNotificationUpdate, 
  onRefreshNotifications 
}: UseReferralActionsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const isDisabled = !adminId;

  const handleReferralAction = async (
    referralId: string, 
    action: 'accepted' | 'declined', 
    selectedNotification: ReferralNotification
  ) => {
    if (isDisabled) {
      console.warn('Referral action attempted without a valid admin ID');
      return;
    }
    setLoading(true);
    try {
      // Get current admin's profile for proper logging with fresh data
      const adminProfile = await ReferralService.getAdminProfile(adminId);
      
      // Update referral status
      await ReferralService.updateReferralStatus(referralId, action);

      if (action === 'accepted') {
        // Transfer ticket assignment to the referred admin
        await ReferralService.updateTicketAssignment(
          selectedNotification.ticket_id, 
          adminId, 
          adminProfile?.full_name
        );

        // Log activity with correct admin details and ensure department is captured
        await ReferralService.logTicketActivity(
          selectedNotification.ticket_id,
          adminId,
          'referral_accepted',
          `Referral accepted. Ticket reassigned from ${selectedNotification.referring_admin.full_name}`,
          adminProfile?.full_name,
          adminProfile?.department_code
        );

        toast({
          title: "Referral Accepted",
          description: `Ticket ${selectedNotification.ticket.ticket_number} has been assigned to you`
        });
      } else {
        // Get referring admin's profile to ensure accurate department info
        const referringAdminProfile = await ReferralService.getAdminProfile(selectedNotification.referring_admin_id);
        
        // Return ticket to the original referring admin
        await ReferralService.updateTicketAssignment(
          selectedNotification.ticket_id,
          selectedNotification.referring_admin_id,
          referringAdminProfile?.full_name || selectedNotification.referring_admin.full_name
        );

        // Log decline activity with correct admin details
        await ReferralService.logTicketActivity(
          selectedNotification.ticket_id,
          adminId,
          'referral_declined',
          `Referral declined. Ticket returned to ${selectedNotification.referring_admin.full_name}`,
          adminProfile?.full_name,
          adminProfile?.department_code
        );

        toast({
          title: "Referral Declined",
          description: `You have declined the referral for ticket ${selectedNotification.ticket.ticket_number}. The ticket has been returned to ${selectedNotification.referring_admin.full_name}`
        });
      }

      onRefreshNotifications();
      onNotificationUpdate();
    } catch (error) {
      console.error('Error handling referral action:', error);
      toast({
        title: "Error",
        description: "Failed to process referral action",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleReferralAction
  };
};
