
import { Badge } from '@/components/ui/badge';
import { formatActivityType } from './utils';

interface ActivityBadgeProps {
  activityType: string;
}

export const ActivityBadge = ({ activityType }: ActivityBadgeProps) => {
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'created':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'assigned':
      case 'status_changed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'referred':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'referral_accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'referral_declined':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'resolved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'details_updated':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'escalated_to_infosoft':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'escalation_resolved':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'reopened':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'message_sent':
      case 'comment':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBadgeText = (type: string) => {
    if (type === 'details_updated') {
      return 'Edited';
    }
    if (type === 'escalated_to_infosoft') {
      return 'Escalated';
    }
    if (type === 'escalation_resolved') {
      return 'Escalation Resolved';
    }
    if (type === 'reopened') {
      return 'Reopened';
    }
    if (type === 'message_sent' || type === 'comment') {
      return 'Message';
    }
    return formatActivityType(type);
  };

  return (
    <Badge className={getBadgeColor(activityType)}>
      {getBadgeText(activityType)}
    </Badge>
  );
};
