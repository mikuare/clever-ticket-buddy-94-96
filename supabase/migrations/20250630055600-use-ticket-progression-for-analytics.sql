
-- Drop the existing view and recreate it to use ticket progression data for accurate metrics
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
ticket_progression_metrics AS (
  -- Calculate precise response and resolution times using ticket progression data
  SELECT 
    t.assigned_admin_id as admin_id,
    
    -- Average response time: from ticket creation to assignment (catering)
    AVG(
      CASE 
        WHEN ta_assigned.created_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (ta_assigned.created_at - t.created_at)) / 3600.0
        ELSE NULL
      END
    ) as avg_response_time_hours,
    
    -- Average resolution time: from assignment to resolution
    AVG(
      CASE 
        WHEN ta_resolved.created_at IS NOT NULL AND ta_assigned.created_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (ta_resolved.created_at - ta_assigned.created_at)) / 3600.0
        ELSE NULL
      END
    ) as avg_resolution_time_hours
    
  FROM tickets t
  
  -- Join with assignment activity (when ticket was catered)
  LEFT JOIN ticket_activities ta_assigned ON (
    ta_assigned.ticket_id = t.id 
    AND ta_assigned.activity_type = 'assigned'
    AND ta_assigned.user_id = t.assigned_admin_id
  )
  
  -- Join with resolution activity (when ticket was resolved)
  LEFT JOIN ticket_activities ta_resolved ON (
    ta_resolved.ticket_id = t.id 
    AND ta_resolved.activity_type = 'status_changed'
    AND ta_resolved.description LIKE '%resolved%'
    AND ta_resolved.user_id = t.assigned_admin_id
  )
  
  WHERE t.assigned_admin_id IS NOT NULL
  GROUP BY t.assigned_admin_id
),
-- Fallback to permanent metrics where progression data might be incomplete
combined_performance_stats AS (
  SELECT 
    COALESCE(tpm.admin_id, apm.admin_id) as admin_id,
    
    -- Use progression metrics first, then fall back to permanent metrics
    COALESCE(tpm.avg_response_time_hours, apm.avg_response_time_hours, 0) as avg_response_time_hours,
    COALESCE(tpm.avg_resolution_time_hours, apm.avg_resolution_time_hours, 0) as avg_resolution_time_hours
    
  FROM ticket_progression_metrics tpm
  FULL OUTER JOIN (
    SELECT 
      admin_id,
      AVG(response_time_hours) as avg_response_time_hours,
      AVG(resolution_time_hours) as avg_resolution_time_hours
    FROM public.admin_performance_metrics
    GROUP BY admin_id
  ) apm ON tpm.admin_id = apm.admin_id
)
SELECT 
  ats.admin_id,
  ats.admin_name,
  ats.email,
  COALESCE(ats.total_tickets_catered, 0) as total_tickets_catered,
  COALESCE(ats.tickets_in_progress, 0) as tickets_in_progress,
  COALESCE(ats.tickets_resolved, 0) as tickets_resolved,
  COALESCE(ats.tickets_escalated, 0) as tickets_escalated,
  
  -- Use progression-based metrics for maximum accuracy
  ROUND(COALESCE(cps.avg_response_time_hours, 0), 4) as avg_response_time_hours,
  ROUND(COALESCE(cps.avg_resolution_time_hours, 0), 4) as avg_resolution_time_hours
  
FROM admin_ticket_stats ats
LEFT JOIN combined_performance_stats cps ON ats.admin_id = cps.admin_id
ORDER BY ats.admin_name;

-- Update the summary stats function to use the new progression-based view
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
    ROUND(AVG(NULLIF(aav.avg_response_time_hours, 0)), 4) as avg_response_time_hours,
    ROUND(AVG(NULLIF(aav.avg_resolution_time_hours, 0)), 4) as avg_resolution_time_hours
  FROM admin_analytics_view aav
  WHERE aav.total_tickets_catered > 0;
END;
$$;
