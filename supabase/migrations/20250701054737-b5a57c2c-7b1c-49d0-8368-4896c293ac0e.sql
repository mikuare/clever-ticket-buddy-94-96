
-- Drop and recreate the admin analytics view with improved referral handling
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
referral_response_times AS (
  -- Calculate response times for referred tickets (referral time to acceptance)
  SELECT 
    tr.referred_admin_id as admin_id,
    AVG(
      CASE 
        WHEN ta_accepted.created_at IS NOT NULL AND tr.created_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (ta_accepted.created_at - tr.created_at)) / 3600.0
        ELSE NULL
      END
    ) as avg_referral_response_time_hours
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
direct_assignment_times AS (
  -- Calculate response times for directly assigned tickets (creation to assignment)
  SELECT 
    t.assigned_admin_id as admin_id,
    AVG(
      CASE 
        WHEN ta_assigned.created_at IS NOT NULL AND t.created_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (ta_assigned.created_at - t.created_at)) / 3600.0
        ELSE NULL
      END
    ) as avg_direct_response_time_hours
  FROM tickets t
  LEFT JOIN (
    SELECT DISTINCT ON (ticket_id) 
      ticket_id, 
      created_at,
      user_id
    FROM ticket_activities 
    WHERE activity_type = 'assigned'
    ORDER BY ticket_id, created_at ASC
  ) ta_assigned ON ta_assigned.ticket_id = t.id AND ta_assigned.user_id = t.assigned_admin_id
  WHERE t.assigned_admin_id IS NOT NULL
  -- Exclude tickets that were referred to this admin
  AND NOT EXISTS (
    SELECT 1 FROM ticket_referrals tr2 
    WHERE tr2.ticket_id = t.id 
    AND tr2.referred_admin_id = t.assigned_admin_id 
    AND tr2.status = 'accepted'
  )
  GROUP BY t.assigned_admin_id
),
combined_response_times AS (
  SELECT 
    COALESCE(drt.admin_id, rrt.admin_id) as admin_id,
    CASE 
      WHEN drt.avg_direct_response_time_hours IS NOT NULL AND rrt.avg_referral_response_time_hours IS NOT NULL
      THEN (drt.avg_direct_response_time_hours + rrt.avg_referral_response_time_hours) / 2
      WHEN drt.avg_direct_response_time_hours IS NOT NULL
      THEN drt.avg_direct_response_time_hours
      WHEN rrt.avg_referral_response_time_hours IS NOT NULL
      THEN rrt.avg_referral_response_time_hours
      ELSE 0
    END as avg_response_time_hours
  FROM direct_assignment_times drt
  FULL OUTER JOIN referral_response_times rrt ON drt.admin_id = rrt.admin_id
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
  
  -- Use combined response time calculations
  ROUND(COALESCE(crt.avg_response_time_hours, 0), 6) as avg_response_time_hours,
  ROUND(COALESCE(rt.avg_resolution_time_hours, 0), 6) as avg_resolution_time_hours
  
FROM admin_ticket_stats ats
LEFT JOIN combined_response_times crt ON ats.admin_id = crt.admin_id
LEFT JOIN resolution_times rt ON ats.admin_id = rt.admin_id
ORDER BY ats.admin_name;

-- Create a function to check referral cooldown
CREATE OR REPLACE FUNCTION public.check_referral_cooldown(
  p_ticket_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_referral_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get the most recent referral time for this ticket by this admin
  SELECT created_at INTO last_referral_time
  FROM public.ticket_referrals
  WHERE ticket_id = p_ticket_id 
  AND referring_admin_id = p_admin_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no previous referral, allow the referral
  IF last_referral_time IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check if 5 minutes have passed since last referral
  RETURN (NOW() - last_referral_time) >= INTERVAL '5 minutes';
END;
$$;

-- Create a trigger function to enforce referral cooldown
CREATE OR REPLACE FUNCTION public.enforce_referral_cooldown()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check cooldown before allowing new referral
  IF NOT public.check_referral_cooldown(NEW.ticket_id, NEW.referring_admin_id) THEN
    RAISE EXCEPTION 'Referral cooldown active. Please wait 5 minutes before referring this ticket again.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce referral cooldown
DROP TRIGGER IF EXISTS enforce_referral_cooldown_trigger ON public.ticket_referrals;

CREATE TRIGGER enforce_referral_cooldown_trigger
  BEFORE INSERT ON public.ticket_referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_referral_cooldown();
