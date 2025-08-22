
import type { TicketActivity } from '../types';
import { getDepartmentName } from '../utils';

interface ReferralDeclinedDescriptionProps {
  activity: TicketActivity;
}

export const ReferralDeclinedDescription = ({ activity }: ReferralDeclinedDescriptionProps) => {
  // Skip if admin name or department is unknown/empty
  if (!activity.admin_name || activity.admin_name === 'Unknown Admin' || 
      !activity.department_code || activity.department_code === 'Unknown') {
    return null;
  }
  
  const decliningAdmin = activity.admin_name;
  const decliningDept = getDepartmentName(activity.department_code);
  
  // Check if this is a return to referring admin scenario
  if (activity.description && activity.description.includes('returned to')) {
    return `Referral declined by ${decliningAdmin} from ${decliningDept}. ${activity.description}`;
  }
  
  return `Referral declined by ${decliningAdmin} from ${decliningDept}`;
};
