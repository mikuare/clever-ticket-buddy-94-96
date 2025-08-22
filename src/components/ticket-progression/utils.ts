
import { supabase } from '@/integrations/supabase/client';

export const formatActivityType = (activityType: string): string => {
  switch (activityType) {
    case 'created':
      return 'Created';
    case 'status_changed':
      return 'Status Changed';
    case 'assigned':
      return 'Assigned';
    case 'resolved':
      return 'Resolved';
    case 'closed':
      return 'Closed';
    case 'referred':
      return 'Referred';
    case 'referral_accepted':
      return 'Referral Accepted';
    case 'referral_declined':
      return 'Referral Declined';
    case 'referral_withdrawn':
      return 'Referral Withdrawn';
    case 'details_updated':
      return 'Details Updated';
    case 'escalated_to_infosoft':
      return 'Escalated to Infosoft';
    case 'escalation_resolved':
      return 'Escalation Resolved';
    case 'message_sent':
    case 'comment':
      return 'Message Sent';
    case 'attachment_added':
      return 'Attachment Added';
    default:
      return activityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

// Department mappings for display
const departmentNames: Record<string, string> = {
  'ACC': 'Accounting',
  'ADM': 'Administration',
  'HR': 'Human Resources',
  'IT': 'Information Technology',
  'MKT': 'Marketing',
  'OPS': 'Operations',
  'FIN': 'Finance',
  'SUP': 'Support',
  'LOG': 'Logistics',
  'QA': 'Quality Assurance'
};

export const getDepartmentName = (code: string): string => {
  return departmentNames[code] || code;
};

export const fetchTicketActivities = async (ticketId: string) => {
  const { data, error } = await supabase
    .from('ticket_activities')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching ticket activities:', error);
    throw error;
  }

  return data || [];
};

export const fetchTicketCreator = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, department_code')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching ticket creator:', error);
    return null;
  }

  return data;
};
