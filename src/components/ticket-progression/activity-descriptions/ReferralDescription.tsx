
import type { TicketActivity } from '../types';
import { getDepartmentName } from '../utils';

interface ReferralDescriptionProps {
  activity: TicketActivity;
}

export const ReferralDescription = ({ activity }: ReferralDescriptionProps) => {
  // Skip if admin name or department is unknown/empty
  if (!activity.admin_name || activity.admin_name === 'Unknown Admin' || 
      !activity.department_code || activity.department_code === 'Unknown') {
    return null;
  }
  
  const referredAdminName = activity.description.match(/referred to ([^(]+)/)?.[1]?.trim() || 'Unknown Admin';
  const referringAdmin = activity.admin_name;
  const referringDept = getDepartmentName(activity.department_code);
  
  // Skip if we can't identify the referred admin properly
  if (referredAdminName === 'Unknown Admin') {
    return null;
  }
  
  return `Ticket referred to ${referredAdminName} by ${referringAdmin} from ${referringDept}`;
};
