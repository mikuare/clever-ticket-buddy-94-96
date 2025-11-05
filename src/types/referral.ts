
export interface ReferralNotification {
  id: string;
  ticket_id: string;
  referring_admin_id: string;
  referred_admin_id: string;
  status: string;
  message: string;
  created_at: string;
  responded_at?: string | null;
  ticket: {
    ticket_number: string;
    title: string;
    priority: string;
    department_code: string;
  };
  referring_admin: {
    full_name: string;
    email: string;
  };
  referred_admin?: {
    full_name: string;
    email: string;
  };
}

export interface UseReferralNotificationsProps {
  adminId: string;
  onNotificationUpdate: () => void;
}
