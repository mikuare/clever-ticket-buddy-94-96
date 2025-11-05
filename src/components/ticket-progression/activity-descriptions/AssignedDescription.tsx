
import type { TicketActivity } from '../types';
import { getDepartmentName } from '../utils';

interface AssignedDescriptionProps {
  activity: TicketActivity;
}

export const AssignedDescription = ({ activity }: AssignedDescriptionProps) => {
  const assignedAdmin = activity.admin_name || 'Unknown Admin';
  const assignedDept = getDepartmentName(activity.department_code);
  return `Ticket assigned to ${assignedAdmin} from ${assignedDept}`;
};
