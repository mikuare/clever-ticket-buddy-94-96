
-- Create a view for admin analytics that calculates all the required metrics
CREATE OR REPLACE VIEW admin_analytics_view AS
WITH admin_ticket_stats AS (
  SELECT 
    p.id as admin_id,
    p.full_name as admin_name,
    p.department_code,
    p.email,
    
    -- Total tickets catered (assigned and accepted)
    COUNT(CASE WHEN t.assigned_admin_id = p.id THEN 1 END) as total_tickets_catered,
    
    -- Tickets in progress
    COUNT(CASE WHEN t.assigned_admin_id = p.id AND t.status = 'In Progress' THEN 1 END) as tickets_in_progress,
    
    -- Tickets resolved
    COUNT(CASE WHEN t.assigned_admin_id = p.id AND t.status = 'Resolved' THEN 1 END) as tickets_resolved,
    
    -- Tickets escalated (referred to other admins)
    COUNT(CASE WHEN tr.referring_admin_id = p.id THEN 1 END) as tickets_escalated,
    
    -- Average response time (from ticket creation to assignment) in hours
    AVG(
      CASE 
        WHEN t.assigned_admin_id = p.id AND t.status != 'Open' 
        THEN EXTRACT(EPOCH FROM (
          COALESCE(
            (SELECT MIN(created_at) FROM ticket_activities WHERE ticket_id = t.id AND activity_type = 'assigned'),
            t.updated_at
          ) - t.created_at
        )) / 3600.0
      END
    ) as avg_response_time_hours,
    
    -- Average resolution time (from assignment to resolution) in hours
    AVG(
      CASE 
        WHEN t.assigned_admin_id = p.id AND t.admin_resolved_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (t.admin_resolved_at - COALESCE(
          (SELECT MIN(created_at) FROM ticket_activities WHERE ticket_id = t.id AND activity_type = 'assigned'),
          t.created_at
        ))) / 3600.0
      END
    ) as avg_resolution_time_hours
    
  FROM profiles p
  LEFT JOIN tickets t ON t.assigned_admin_id = p.id
  LEFT JOIN ticket_referrals tr ON tr.referring_admin_id = p.id
  WHERE p.is_admin = true
  GROUP BY p.id, p.full_name, p.department_code, p.email
)
SELECT 
  admin_id,
  admin_name,
  department_code,
  email,
  COALESCE(total_tickets_catered, 0) as total_tickets_catered,
  COALESCE(tickets_in_progress, 0) as tickets_in_progress,
  COALESCE(tickets_resolved, 0) as tickets_resolved,
  COALESCE(tickets_escalated, 0) as tickets_escalated,
  ROUND(COALESCE(avg_response_time_hours, 0), 2) as avg_response_time_hours,
  ROUND(COALESCE(avg_resolution_time_hours, 0), 2) as avg_resolution_time_hours
FROM admin_ticket_stats
ORDER BY admin_name;

-- Create a function to get overall admin summary statistics
CREATE OR REPLACE FUNCTION get_admin_summary_stats()
RETURNS TABLE(
  total_tickets_all_admins BIGINT,
  total_tickets_in_progress BIGINT,
  avg_response_time_hours NUMERIC,
  avg_resolution_time_hours NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(total_tickets_catered)::BIGINT as total_tickets_all_admins,
    SUM(tickets_in_progress)::BIGINT as total_tickets_in_progress,
    ROUND(AVG(NULLIF(avg_response_time_hours, 0)), 2) as avg_response_time_hours,
    ROUND(AVG(NULLIF(avg_resolution_time_hours, 0)), 2) as avg_resolution_time_hours
  FROM admin_analytics_view
  WHERE total_tickets_catered > 0;
END;
$$;
