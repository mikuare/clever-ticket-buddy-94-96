
-- Fix the admin analytics view to properly include response times for admins who escalated/referred tickets
-- Ensure original admin's response time is ALWAYS included in their metrics
DROP VIEW IF EXISTS public.admin_analytics_view;

CREATE OR REPLACE VIEW admin_analytics_view AS
WITH admin_ticket_stats AS (
  SELECT 
    p.id as admin_id,
    p.full_name as admin_name,
    p.email,
    
    -- Total tickets catered (assigned and accepted referrals)
    COUNT(CASE WHEN t.assigned_admin_id = p.id THEN 1 END) as total_tickets_catered,
    
    -- Tickets in progress
    COUNT(CASE WHEN t.assigned_admin_id = p.id AND t.status = 'In Progress' THEN 1 END) as tickets_in_progress,
    
    -- Tickets resolved
    COUNT(CASE WHEN t.assigned_admin_id = p.id AND t.status IN ('Resolved', 'Closed') THEN 1 END) as tickets_resolved,
    
    -- Tickets escalated (referred to other admins) - deduplicated
    COUNT(DISTINCT CASE WHEN tr.referring_admin_id = p.id AND tr.status != 'cancelled' THEN tr.ticket_id END) as tickets_escalated
    
  FROM profiles p
  LEFT JOIN tickets t ON t.assigned_admin_id = p.id
  LEFT JOIN ticket_referrals tr ON tr.referring_admin_id = p.id
  WHERE p.is_admin = true
  GROUP BY p.id, p.full_name, p.email
),
-- Get ALL admins who first catered tickets (including those who later referred/escalated)
all_first_cater_response_times AS (
  SELECT 
    ta_first.user_id as admin_id,
    AVG(
      CASE 
        WHEN ta_first.created_at IS NOT NULL AND t.created_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (ta_first.created_at - t.created_at)) / 3600.0
        ELSE NULL
      END
    ) as avg_first_cater_response_time_hours,
    COUNT(*) as first_cater_count
  FROM tickets t
  JOIN (
    -- Get the very first assignment activity for each ticket (original admin who catered first)
    SELECT DISTINCT ON (ticket_id) 
      ticket_id, 
      created_at,
      user_id
    FROM ticket_activities 
    WHERE activity_type = 'assigned'
    ORDER BY ticket_id, created_at ASC
  ) ta_first ON ta_first.ticket_id = t.id
  WHERE ta_first.user_id IS NOT NULL
  GROUP BY ta_first.user_id
),
-- Get response times for admins who received referrals
referral_acceptance_response_times AS (
  SELECT 
    tr.referred_admin_id as admin_id,
    AVG(
      CASE 
        WHEN ta_accepted.created_at IS NOT NULL AND tr.created_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (ta_accepted.created_at - tr.created_at)) / 3600.0
        ELSE NULL
      END
    ) as avg_referral_response_time_hours,
    COUNT(*) as referral_acceptance_count
  FROM ticket_referrals tr
  JOIN ticket_activities ta_accepted ON (
    ta_accepted.ticket_id = tr.ticket_id 
    AND ta_accepted.activity_type = 'referral_accepted'
    AND ta_accepted.user_id = tr.referred_admin_id
    AND ta_accepted.created_at >= tr.created_at
  )
  WHERE tr.status = 'accepted'
  GROUP BY tr.referred_admin_id
),
-- Combine all response times properly weighted
combined_response_times AS (
  SELECT 
    COALESCE(fcrt.admin_id, rart.admin_id) as admin_id,
    CASE 
      -- If admin has both first-cater and referral acceptance response times, calculate weighted average
      WHEN fcrt.avg_first_cater_response_time_hours IS NOT NULL AND rart.avg_referral_response_time_hours IS NOT NULL
      THEN (
        (fcrt.avg_first_cater_response_time_hours * fcrt.first_cater_count) + 
        (rart.avg_referral_response_time_hours * rart.referral_acceptance_count)
      ) / (fcrt.first_cater_count + rart.referral_acceptance_count)
      -- If admin only has first-cater response time (includes those who referred/escalated)
      WHEN fcrt.avg_first_cater_response_time_hours IS NOT NULL
      THEN fcrt.avg_first_cater_response_time_hours
      -- If admin only has referral acceptance response time
      WHEN rart.avg_referral_response_time_hours IS NOT NULL
      THEN rart.avg_referral_response_time_hours
      ELSE 0
    END as avg_response_time_hours
  FROM all_first_cater_response_times fcrt
  FULL OUTER JOIN referral_acceptance_response_times rart ON fcrt.admin_id = rart.admin_id
),
resolution_times AS (
  -- Calculate resolution times (assignment/acceptance to resolution)
  SELECT 
    t.assigned_admin_id as admin_id,
    AVG(
      CASE 
        WHEN ta_resolved.created_at IS NOT NULL AND ta_start.created_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (ta_resolved.created_at - ta_start.created_at)) / 3600.0
        ELSE NULL
      END
    ) as avg_resolution_time_hours
  FROM tickets t
  
  -- Get the starting point (either assignment or referral acceptance)
  LEFT JOIN (
    SELECT 
      ticket_id,
      user_id,
      created_at,
      ROW_NUMBER() OVER (PARTITION BY ticket_id, user_id ORDER BY created_at ASC) as rn
    FROM ticket_activities 
    WHERE activity_type IN ('assigned', 'referral_accepted')
  ) ta_start ON ta_start.ticket_id = t.id 
    AND ta_start.user_id = t.assigned_admin_id 
    AND ta_start.rn = 1
  
  -- Get resolution time
  LEFT JOIN (
    SELECT DISTINCT ON (ticket_id, user_id)
      ticket_id,
      created_at,
      user_id
    FROM ticket_activities 
    WHERE activity_type = 'status_changed' 
    AND (description ILIKE '%resolved%' OR description ILIKE '%marked as resolved%')
    ORDER BY ticket_id, user_id, created_at DESC
  ) ta_resolved ON ta_resolved.ticket_id = t.id AND ta_resolved.user_id = t.assigned_admin_id
  
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
  
  -- Include response times for ALL admins including those who escalated/referred
  ROUND(COALESCE(crt.avg_response_time_hours, 0), 6) as avg_response_time_hours,
  ROUND(COALESCE(rt.avg_resolution_time_hours, 0), 6) as avg_resolution_time_hours
  
FROM admin_ticket_stats ats
LEFT JOIN combined_response_times crt ON ats.admin_id = crt.admin_id
LEFT JOIN resolution_times rt ON ats.admin_id = rt.admin_id
ORDER BY ats.admin_name;

-- Update the summary stats function to properly calculate averages
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
    -- Simple average of all admins' response times (as requested: sum all / count)
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
  FROM admin_analytics_view aav;
END;
$$;
