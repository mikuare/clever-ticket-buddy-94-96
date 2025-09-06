
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import type { DepartmentNotification } from '@/types/admin';

interface DepartmentNotificationsProps {
  notifications: DepartmentNotification[];
  onDepartmentClick: (departmentCode: string) => void;
}

const DepartmentNotifications = ({ notifications, onDepartmentClick }: DepartmentNotificationsProps) => {
  if (notifications.length === 0) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Department Alerts
        </CardTitle>
        <CardDescription>Departments with open tickets requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notifications.map((notification) => (
            <div
              key={notification.department.code}
              className="p-4 border rounded-lg bg-red-50 border-red-200 hover:bg-red-100 cursor-pointer transition-colors"
              onClick={() => onDepartmentClick(notification.department.code)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-red-900">{notification.department.code}</h3>
                  <p className="text-sm text-red-700">{notification.department.name}</p>
                </div>
                <Badge className="bg-red-500 text-white">
                  {notification.openTickets.length}
                </Badge>
              </div>
              <div className="text-xs text-gray-600">
                {notification.openTickets.length} open ticket{notification.openTickets.length !== 1 ? 's' : ''} requiring attention
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DepartmentNotifications;
