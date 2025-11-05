
import type { TicketActivity, TicketCreator } from '../types';
import { getDepartmentName } from '../utils';

interface CreatedDescriptionProps {
  activity: TicketActivity;
  ticketCreator: TicketCreator | null;
}

export const CreatedDescription = ({ activity, ticketCreator }: CreatedDescriptionProps) => {
  const userName = ticketCreator?.full_name || 'Unknown User';
  const userDept = getDepartmentName(ticketCreator?.department_code);
  return `Ticket created by ${userName} from ${userDept}`;
};
