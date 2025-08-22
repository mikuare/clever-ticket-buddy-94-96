import type { TicketActivity } from '../types';

interface EscalatedToInfosoftDescriptionProps {
  activity: TicketActivity;
}

export const EscalatedToInfosoftDescription = ({ activity }: EscalatedToInfosoftDescriptionProps) => {
  return (
    <span>
      Ticket escalated to <span className="font-semibold text-orange-600">Infosoft Dev Team</span> by{' '}
      <span className="font-medium">{activity.admin_name || 'Admin'}</span>
    </span>
  );
};