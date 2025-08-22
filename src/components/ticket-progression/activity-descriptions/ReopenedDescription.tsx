import type { TicketActivity } from '../types';

interface ReopenedDescriptionProps {
  activity: TicketActivity;
}

export const ReopenedDescription = ({ activity }: ReopenedDescriptionProps) => {
  return (
    <span>
      <span className="font-medium text-orange-700">Ticket reopened</span> by user - resolution not satisfactory
    </span>
  );
};