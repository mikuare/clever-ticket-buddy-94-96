
export interface EscalatedTicket {
  escalation_id: string;
  ticket_id: string;
  ticket_number: string;
  ticket_title: string;
  ticket_description: string;
  ticket_priority: string;
  ticket_department_code: string;
  ticket_created_at: string;
  escalated_by_admin_id: string;
  escalated_by_admin_name: string;
  escalation_reason: string;
  escalated_at: string;
  user_full_name: string;
  user_email: string;
  resolution_notes?: any;
}
