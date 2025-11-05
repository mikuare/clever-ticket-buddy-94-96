
import type { Ticket } from '@/hooks/useUserTickets';

export const getTicketMetadata = (ticket: Ticket) => {
  try {
    const attachments = ticket.attachments as any;
    if (attachments && typeof attachments === 'object') {
      return {
        classification: attachments.classification || 'N/A',
        categoryType: attachments.categoryType || 'N/A',
        acumaticaModule: attachments.acumaticaModule || 'N/A'
      };
    }
  } catch (error) {
    console.log('Error parsing ticket metadata:', error);
  }
  return {
    classification: 'N/A',
    categoryType: 'N/A',
    acumaticaModule: 'N/A'
  };
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'in progress':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'resolved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'closed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
