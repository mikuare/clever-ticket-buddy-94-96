
import { MessageSquare } from 'lucide-react';

export const TicketListEmpty = () => {
  return (
    <div className="text-center py-8 text-gray-500">
      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>No tickets found for the selected filter.</p>
    </div>
  );
};
