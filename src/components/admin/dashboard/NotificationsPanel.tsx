
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import DepartmentNotifications from '../DepartmentNotifications';
import UserNotifications from '../UserNotifications';
import ReferralNotifications from '../ReferralNotifications';
import MyReferralsNotifications from '../MyReferralsNotifications';
import type { DepartmentNotification, UserNotification } from '@/types/admin';

interface NotificationsPanelProps {
  showNotifications: boolean;
  totalNotifications: number;
  departmentNotifications: DepartmentNotification[];
  userNotifications: UserNotification[];
  profileId: string;
  onSetSelectedDepartment: (department: string) => void;
  onFetchTickets: () => void;
  onClose: () => void;
}

const NotificationsPanel = ({
  showNotifications,
  totalNotifications,
  departmentNotifications,
  userNotifications,
  profileId,
  onSetSelectedDepartment,
  onFetchTickets,
  onClose
}: NotificationsPanelProps) => {
  if (!showNotifications) return null;

  return (
    <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Bell className="w-4 h-4" />
        Notifications
        {totalNotifications > 0 && (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            {totalNotifications}
          </Badge>
        )}
      </h3>
      
      <div className="space-y-4">
        <DepartmentNotifications 
          notifications={departmentNotifications} 
          onDepartmentClick={onSetSelectedDepartment}
        />
        <UserNotifications notifications={userNotifications} />
        <ReferralNotifications 
          adminId={profileId}
          onNotificationUpdate={onFetchTickets}
        />
        <MyReferralsNotifications 
          adminId={profileId}
        />
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onClose}
        >
          Close Notifications
        </Button>
      </div>
    </div>
  );
};

export default NotificationsPanel;
