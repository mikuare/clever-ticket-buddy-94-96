
export interface TicketActivity {
  id: string;
  activity_type: string;
  description: string;
  admin_name?: string;
  department_code?: string;
  created_at: string;
  user_id: string;
}

export interface TicketCreator {
  full_name: string;
  department_code: string;
}
