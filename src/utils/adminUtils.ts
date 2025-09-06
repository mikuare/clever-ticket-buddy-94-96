
import type { Json } from '@/integrations/supabase/types';

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open': return 'bg-green-100 text-green-800 border-green-200';
    case 'in progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'resolved': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'closed': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export { getAttachmentsArray } from './attachmentUtils';

export const getDaysAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
