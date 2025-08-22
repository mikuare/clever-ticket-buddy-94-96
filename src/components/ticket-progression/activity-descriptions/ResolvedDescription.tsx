
import type { TicketActivity } from '../types';
import { getDepartmentName } from '../utils';

interface ResolvedDescriptionProps {
  activity: TicketActivity;
}

export const ResolvedDescription = ({ activity }: ResolvedDescriptionProps) => {
  const resolvingAdmin = activity.admin_name || 'Unknown Admin';
  const resolvingDept = getDepartmentName(activity.department_code);
  return `Ticket resolved by ${resolvingAdmin} from ${resolvingDept}`;
};
