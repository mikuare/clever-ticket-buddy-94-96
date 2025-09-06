
import type { TicketActivity } from '../types';
import { getDepartmentName } from '../utils';

interface ReferralAcceptedDescriptionProps {
  activity: TicketActivity;
}

export const ReferralAcceptedDescription = ({ activity }: ReferralAcceptedDescriptionProps) => {
  // Skip if admin name or department is unknown/empty
  if (!activity.admin_name || activity.admin_name === 'Unknown Admin' || 
      !activity.department_code || activity.department_code === 'Unknown') {
    return null;
  }
  
  const acceptingAdmin = activity.admin_name;
  const acceptingDept = getDepartmentName(activity.department_code);
  return `Referral accepted by ${acceptingAdmin} from ${acceptingDept}`;
};
