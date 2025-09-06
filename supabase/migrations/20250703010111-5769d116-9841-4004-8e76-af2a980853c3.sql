-- Update summary stats function to also exclude escalated tickets
CREATE OR REPLACE FUNCTION public.get_admin_summary_stats_by_date_range(start_date date DEFAULT NULL::date, end_date date DEFAULT NULL::date)
RETURNS TABLE(total_tickets_all_admins bigint, total_tickets_in_progress bigint, avg_response_time_hours numeric, avg_resolution_time_hours numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(aav.total_tickets_catered)::BIGINT as total_tickets_all_admins,
    SUM(aav.tickets_in_progress)::BIGINT as total_tickets_in_progress,
    ROUND(
      CASE 
        WHEN COUNT(CASE WHEN aav.avg_response_time_hours > 0 THEN 1 END) > 0
        THEN AVG(CASE WHEN aav.avg_response_time_hours > 0 THEN aav.avg_response_time_hours END)
        ELSE 0
      END, 6
    ) as avg_response_time_hours,
    ROUND(
      CASE 
        WHEN COUNT(CASE WHEN aav.avg_resolution_time_hours > 0 THEN 1 END) > 0
        THEN AVG(CASE WHEN aav.avg_resolution_time_hours > 0 THEN aav.avg_resolution_time_hours END)
        ELSE 0
      END, 6
    ) as avg_resolution_time_hours
  FROM get_admin_analytics_by_date_range(start_date, end_date) aav;
END;
$$;