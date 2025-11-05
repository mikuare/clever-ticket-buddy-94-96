import type { TicketActivity } from '../types';

interface EscalationResolvedDescriptionProps {
  activity: TicketActivity;
}

export const EscalationResolvedDescription = ({ activity }: EscalationResolvedDescriptionProps) => {
  return (
    <span>
      <span className="font-semibold text-orange-500">Infosoft Dev escalation resolved</span> by{' '}
      <span className="font-medium">{activity.admin_name || 'Admin'}</span>
    </span>
  );
};