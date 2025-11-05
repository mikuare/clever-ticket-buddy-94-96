
import type { TicketActivity, TicketCreator } from '../types';
import { getDepartmentName } from '../utils';

interface ClosedDescriptionProps {
  activity: TicketActivity;
  ticketCreator: TicketCreator | null;
}

export const ClosedDescription = ({ activity, ticketCreator }: ClosedDescriptionProps) => {
  if (activity.description && activity.description.includes('user')) {
    const userName = ticketCreator?.full_name || 'User';
    const userDept = getDepartmentName(ticketCreator?.department_code);
    return `Ticket closed by ${userName} from ${userDept}`;
  }
  return 'Ticket automatically closed due to time limit';
};
