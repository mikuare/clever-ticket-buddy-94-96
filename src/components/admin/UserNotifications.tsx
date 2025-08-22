
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Clock, AlertTriangle } from 'lucide-react';
import { getDaysAgo } from '@/utils/adminUtils';
import type { UserNotification } from '@/types/admin';

interface UserNotificationsProps {
  notifications: UserNotification[];
}

const UserNotifications = ({ notifications }: UserNotificationsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Filter out notifications with tickets older than 1 day
  const activeNotifications = notifications.filter(notification => {
    const daysAgo = getDaysAgo(notification.oldestTicket.created_at);
    return daysAgo <= 1;
  });

  if (activeNotifications.length === 0) return null;

  const getPriorityColor = (ticketCount: number) => {
    if (ticketCount >= 5) return 'bg-red-100 border-red-300 text-red-900';
    if (ticketCount >= 3) return 'bg-orange-100 border-orange-300 text-orange-900';
    return 'bg-yellow-100 border-yellow-300 text-yellow-900';
  };

  const getPriorityIcon = (ticketCount: number) => {
    if (ticketCount >= 5) return <AlertTriangle className="w-4 h-4 text-red-600" />;
    if (ticketCount >= 3) return <Clock className="w-4 h-4 text-orange-600" />;
    return <User className="w-4 h-4 text-yellow-600" />;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Sort notifications by ticket count (most tickets first)
  const sortedNotifications = [...activeNotifications].sort((a, b) => {
    return b.openTickets.length - a.openTickets.length;
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="fixed bottom-6 right-[88px] z-50 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 group">
          <User className="w-6 h-6" />
          {activeNotifications.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {activeNotifications.length}
            </div>
          )}
          <div className="absolute bottom-full right-0 mb-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            User Alerts
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-orange-500" />
            User Alerts ({activeNotifications.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Users with multiple open tickets requiring attention (within the last day)
          </p>
          
          <div className="space-y-3">
            {sortedNotifications.slice(0, 15).map((notification, index) => {
              const ticketCount = notification.openTickets.length;
              const priorityClass = getPriorityColor(ticketCount);
              const priorityIcon = getPriorityIcon(ticketCount);
              
              return (
                <div
                  key={`${notification.user.email}-${index}`}
                  className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${priorityClass}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {priorityIcon}
                        <h4 className="font-semibold text-sm truncate">
                          {notification.user.full_name}
                        </h4>
                        <Badge 
                          variant="secondary" 
                          className="bg-white/80 text-xs font-medium shrink-0"
                        >
                          {ticketCount} open ticket{ticketCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <p className="truncate">
                          <span className="font-medium">Email:</span> {notification.user.email}
                        </p>
                        <p>
                          <span className="font-medium">Department:</span> {notification.user.department_code}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <div className="text-xs font-medium mb-1">
                        Latest Ticket
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold">
                          {formatDateTime(notification.oldestTicket.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-white/30">
                    <div className="text-xs">
                      <span className="font-medium">Latest issue:</span>{' '}
                      <span className="truncate inline-block max-w-[300px]" title={notification.oldestTicket.title}>
                        {notification.oldestTicket.title}
                      </span>
                    </div>
                    {ticketCount > 1 && (
                      <div className="text-xs mt-1 opacity-75">
                        + {ticketCount - 1} other open ticket{ticketCount - 1 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {activeNotifications.length > 15 && (
              <div className="text-center pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing top 15 alerts. {activeNotifications.length - 15} more users need attention.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserNotifications;
