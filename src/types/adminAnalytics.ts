
export interface AdminAnalytics {
  admin_id: string;
  admin_name: string;
  email: string;
  total_tickets_catered: number;
  tickets_in_progress: number;
  tickets_resolved: number;
  tickets_escalated: number;
  avg_response_time_hours: number;
  avg_resolution_time_hours: number;
}

export interface AdminSummaryStats {
  total_tickets_all_admins: number;
  total_tickets_in_progress: number;
  avg_response_time_hours: number;
  avg_resolution_time_hours: number;
  total_tickets_escalated_to_dev: number;
}
