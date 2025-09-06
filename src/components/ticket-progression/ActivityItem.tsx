
import { Badge } from '@/components/ui/badge';
import { ActivityIcon } from './ActivityIcon';
import { ActivityBadge } from './ActivityBadge';
import { ActivityDescription } from './ActivityDescription';
import { formatDateTime, getDepartmentName } from './utils';
import type { TicketActivity, TicketCreator } from './types';

interface ActivityItemProps {
  activity: TicketActivity;
  ticketCreator: TicketCreator | null;
  isLast: boolean;
}

const getStatusFromActivity = (activityType: string, description: string): string | null => {
  switch (activityType) {
    case 'created':
      return 'Open';
    case 'assigned':
      return 'In Progress';
    case 'resolved':
      return 'Resolved';
    case 'closed':
      return 'Closed';
    case 'status_changed':
      // Extract status from description
      if (description.includes('Status changed to')) {
        const statusMatch = description.match(/Status changed to (\w+)/);
        return statusMatch ? statusMatch[1] : null;
      }
      if (description.includes('marked as resolved')) {
        return 'Resolved';
      }
      if (description.includes('closed')) {
        return 'Closed';
      }
      return null;
    case 'referral_accepted':
      return 'In Progress';
    case 'reopened':
      return 'Open';
    default:
      return null;
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'in progress':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'resolved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'closed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const ActivityItem = ({ activity, ticketCreator, isLast }: ActivityItemProps) => {
  const status = getStatusFromActivity(activity.activity_type, activity.description);
  
  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
      <div className="flex-shrink-0 mt-1">
        <ActivityIcon activityType={activity.activity_type} />
      </div>
      
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <ActivityBadge activityType={activity.activity_type} />
          {status && (
            <Badge className={`${getStatusBadgeColor(status)} font-medium`}>
              Status: {status}
            </Badge>
          )}
          <span className="text-sm text-gray-500">
            {formatDateTime(activity.created_at)}
          </span>
        </div>
        
        <ActivityDescription activity={activity} ticketCreator={ticketCreator} />
        
        <div className="flex flex-col gap-1 text-xs">
          {activity.admin_name && activity.activity_type !== 'created' && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Admin:</span>
              <span className="font-medium text-gray-700">{activity.admin_name}</span>
              {activity.department_code && (
                <>
                  <span className="text-gray-400">•</span>
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {activity.department_code}
                  </Badge>
                  <span className="text-gray-600">
                    ({getDepartmentName(activity.department_code)})
                  </span>
                </>
              )}
            </div>
          )}
          
          {activity.activity_type === 'created' && ticketCreator && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Creator Department:</span>
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                {ticketCreator.department_code}
              </Badge>
              <span className="text-gray-600">
                ({getDepartmentName(ticketCreator.department_code)})
              </span>
            </div>
          )}
        </div>
      </div>
      
      {!isLast && (
        <div className="absolute left-6 mt-12 w-px h-8 bg-gray-200" />
      )}
    </div>
  );
};
