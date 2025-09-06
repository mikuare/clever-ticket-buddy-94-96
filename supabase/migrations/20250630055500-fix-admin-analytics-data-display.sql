
-- Update the admin analytics view to properly combine permanent metrics with current ticket data
DROP VIEW IF EXISTS public.admin_analytics_view;

CREATE OR REPLACE VIEW admin_analytics_view AS
WITH admin_ticket_stats AS (
  SELECT 
    p.id as admin_id,
    p.full_name as admin_name,
    p.email,
    
    -- Total tickets catered (assigned and accepted)
    COUNT(CASE WHEN t.assigned_admin_id = p.id THEN 1 END) as total_tickets_catered,
    
    -- Tickets in progress
    COUNT(CASE WHEN t.assigned_admin_id = p.id AND t.status = 'In Progress' THEN 1 END) as tickets_in_progress,
    
    -- Tickets resolved
    COUNT(CASE WHEN t.assigned_admin_id = p.id AND t.status IN ('Resolved', 'Closed') THEN 1 END) as tickets_resolved,
    
    -- Tickets escalated (referred to other admins)
    COUNT(CASE WHEN tr.referring_admin_id = p.id THEN 1 END) as tickets_escalated
    
  FROM profiles p
  LEFT JOIN tickets t ON t.assigned_admin_id = p.id
  LEFT JOIN ticket_referrals tr ON tr.referring_admin_id = p.id
  WHERE p.is_admin = true
  GROUP BY p.id, p.full_name, p.email
),
admin_performance_stats AS (
  SELECT 
    admin_id,
    AVG(response_time_hours) as avg_response_time_hours,
    AVG(resolution_time_hours) as avg_resolution_time_hours
  FROM public.admin_performance_metrics
  GROUP BY admin_id
),
current_ticket_metrics AS (
  -- Calculate metrics for tickets that are not yet resolved (fallback for current tickets)
  SELECT 
    t.assigned_admin_id as admin_id,
    AVG(
      CASE 
        WHEN t.assigned_admin_id IS NOT NULL AND t.status != 'Open' 
        THEN EXTRACT(EPOCH FROM (
          COALESCE(
            (SELECT MIN(created_at) FROM ticket_activities WHERE ticket_id = t.id AND activity_type = 'assigned'),
            t.updated_at
          ) - t.created_at
        )) / 3600.0
      END
    ) as current_avg_response_time_hours,
    
    AVG(
      CASE 
        WHEN t.assigned_admin_id IS NOT NULL AND t.admin_resolved_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (t.admin_resolved_at - COALESCE(
          (SELECT MIN(created_at) FROM ticket_activities WHERE ticket_id = t.id AND activity_type = 'assigned'),
          t.created_at
        ))) / 3600.0
      END
    ) as current_avg_resolution_time_hours
  FROM tickets t
  WHERE t.assigned_admin_id IS NOT NULL
  GROUP BY t.assigned_admin_id
)
SELECT 
  ats.admin_id,
  ats.admin_name,
  ats.email,
  COALESCE(ats.total_tickets_catered, 0) as total_tickets_catered,
  COALESCE(ats.tickets_in_progress, 0) as tickets_in_progress,
  COALESCE(ats.tickets_resolved, 0) as tickets_resolved,
  COALESCE(ats.tickets_escalated, 0) as tickets_escalated,
  
  -- Use permanent metrics first, then fall back to current calculations
  ROUND(COALESCE(
    aps.avg_response_time_hours, 
    ctm.current_avg_response_time_hours, 
    0
  ), 2) as avg_response_time_hours,
  
  ROUND(COALESCE(
    aps.avg_resolution_time_hours, 
    ctm.current_avg_resolution_time_hours, 
    0
  ), 2) as avg_resolution_time_hours
  
FROM admin_ticket_stats ats
LEFT JOIN admin_performance_stats aps ON ats.admin_id = aps.admin_id
LEFT JOIN current_ticket_metrics ctm ON ats.admin_id = ctm.admin_id
ORDER BY ats.admin_name;

-- Update the summary stats function to properly combine data
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
    SUM(aav.total_tickets_catered)::BIGINT as total_tickets_all_admins,
    SUM(aav.tickets_in_progress)::BIGINT as total_tickets_in_progress,
    ROUND(AVG(NULLIF(aav.avg_response_time_hours, 0)), 2) as avg_response_time_hours,
    ROUND(AVG(NULLIF(aav.avg_resolution_time_hours, 0)), 2) as avg_resolution_time_hours
  FROM admin_analytics_view aav
  WHERE aav.total_tickets_catered > 0;
END;
$$;
