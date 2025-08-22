
import type { Ticket } from '@/types/admin';

export const extractTicketDetails = (ticket: Ticket) => {
  const attachments = ticket.attachments;
  if (attachments && typeof attachments === 'object' && !Array.isArray(attachments)) {
    const attachmentObj = attachments as Record<string, any>;
    return {
      classification: attachmentObj.classification || '',
      categoryType: attachmentObj.categoryType || '',
      acumaticaModule: attachmentObj.acumaticaModule || ''
    };
  }
  return {
    classification: '',
    categoryType: '',
    acumaticaModule: ''
  };
};
