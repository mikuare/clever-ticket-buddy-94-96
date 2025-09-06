
import { Clock, User, UserCheck, ArrowRight, CheckCircle, X, Edit, Zap, RotateCcw } from 'lucide-react';

interface ActivityIconProps {
  activityType: string;
}

export const ActivityIcon = ({ activityType }: ActivityIconProps) => {
  switch (activityType) {
    case 'created':
      return <User className="w-4 h-4 text-blue-500" />;
    case 'assigned':
    case 'status_changed':
      return <UserCheck className="w-4 h-4 text-green-500" />;
    case 'referred':
      return <ArrowRight className="w-4 h-4 text-orange-500" />;
    case 'referral_accepted':
      return <UserCheck className="w-4 h-4 text-green-600" />;
    case 'referral_declined':
      return <X className="w-4 h-4 text-red-500" />;
    case 'resolved':
      return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    case 'closed':
      return <X className="w-4 h-4 text-gray-500" />;
    case 'details_updated':
      return <Edit className="w-4 h-4 text-purple-600" />;
    case 'escalated_to_infosoft':
      return <Zap className="w-4 h-4 text-orange-600" />;
    case 'escalation_resolved':
      return <CheckCircle className="w-4 h-4 text-orange-500" />;
    case 'reopened':
      return <RotateCcw className="w-4 h-4 text-orange-600" />;
    case 'message_sent':
    case 'comment':
      return <Clock className="w-4 h-4 text-blue-400" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};
