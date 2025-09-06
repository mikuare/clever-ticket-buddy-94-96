
-- Update admin analytics view to preserve original admin's response time even when tickets are referred
DROP VIEW IF EXISTS public.admin_analytics_view;

CREATE OR REPLACE VIEW admin_analytics_view AS
WITH admin_ticket_stats AS (
  SELECT 
    p.id as admin_id,
    p.full_name as admin_name,
    p.email,
    
    -- Total tickets catered and handled until resolution (excluding referred tickets)
    COUNT(CASE 
      WHEN t.assigned_admin_id = p.id 
      AND NOT EXISTS (
        SELECT 1 FROM ticket_referrals tr 
        WHERE tr.ticket_id = t.id 
        AND tr.referring_admin_id = p.id 
        AND tr.status = 'accepted'
      )
      THEN 1 END) as total_tickets_catered,
    
    -- Tickets in progress (only those not referred)
    COUNT(CASE 
      WHEN t.assigned_admin_id = p.id 
      AND t.status = 'In Progress'
      AND NOT EXISTS (
        SELECT 1 FROM ticket_referrals tr 
        WHERE tr.ticket_id = t.id 
        AND tr.referring_admin_id = p.id 
        AND tr.status = 'accepted'
      )
      THEN 1 END) as tickets_in_progress,
    
    -- Tickets resolved (only those handled until resolution, not referred)
    COUNT(CASE 
      WHEN t.assigned_admin_id = p.id 
      AND t.status IN ('Resolved', 'Closed')
      AND NOT EXISTS (
        SELECT 1 FROM ticket_referrals tr 
        WHERE tr.ticket_id = t.id 
        AND tr.referring_admin_id = p.id 
        AND tr.status = 'accepted'
      )
      THEN 1 END) as tickets_resolved,
    
    -- Tickets escalated/referred to other admins - deduplicated
    COUNT(DISTINCT CASE 
      WHEN tr.referring_admin_id = p.id 
      AND tr.status = 'accepted'
      THEN tr.ticket_id END) as tickets_escalated
    
  FROM profiles p
  LEFT JOIN tickets t ON t.assigned_admin_id = p.id
  LEFT JOIN ticket_referrals tr ON tr.referring_admin_id = p.id
  WHERE p.is_admin = true
  GROUP BY p.id, p.full_name, p.email
),
-- Response times for ALL admins who first catered tickets (including those who later referred)
all_initial_response_times AS (
  SELECT 
    ta_first.user_id as admin_id,
    AVG(
      CASE 
        WHEN ta_first.created_at IS NOT NULL AND t.created_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (ta_first.created_at - t.created_at)) / 3600.0
        ELSE NULL
      END
    ) as avg_initial_response_time_hours,
    COUNT(*) as initial_response_count
  FROM tickets t
  JOIN (
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
-- Response times for admins who received referrals
referral_acceptance_times AS (
  SELECT 
    tr.referred_admin_id as admin_id,
    AVG(
      CASE 
        WHEN ta_accepted.created_at IS NOT NULL AND tr.created_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (ta_accepted.created_at - tr.created_at)) / 3600.0
        ELSE NULL
      END
    ) as avg_referral_response_time_hours,
    COUNT(*) as referral_response_count
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
-- Combined response times - includes ALL admin contributions
combined_response_times AS (
  SELECT 
    COALESCE(airt.admin_id, rat.admin_id) as admin_id,
    CASE 
      -- If admin has both initial and referral response times, calculate weighted average
      WHEN airt.avg_initial_response_time_hours IS NOT NULL AND rat.avg_referral_response_time_hours IS NOT NULL
      THEN (
        (airt.avg_initial_response_time_hours * airt.initial_response_count) + 
        (rat.avg_referral_response_time_hours * rat.referral_response_count)
      ) / (airt.initial_response_count + rat.referral_response_count)
      -- If admin only has initial response time (includes those who referred tickets)
      WHEN airt.avg_initial_response_time_hours IS NOT NULL
      THEN airt.avg_initial_response_time_hours
      -- If admin only has referral acceptance response time
      WHEN rat.avg_referral_response_time_hours IS NOT NULL
      THEN rat.avg_referral_response_time_hours
      ELSE 0
    END as avg_response_time_hours
  FROM all_initial_response_times airt
  FULL OUTER JOIN referral_acceptance_times rat ON airt.admin_id = rat.admin_id
),
-- Resolution times only for tickets that admins resolved (not referred)
admin_resolution_times AS (
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
  -- Only include tickets that were resolved by this admin (not referred to others)
  AND NOT EXISTS (
    SELECT 1 FROM ticket_referrals tr 
    WHERE tr.ticket_id = t.id 
    AND tr.referring_admin_id = t.assigned_admin_id 
    AND tr.status = 'accepted'
  )
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
  ROUND(COALESCE(rest.avg_resolution_time_hours, 0), 6) as avg_resolution_time_hours
  
FROM admin_ticket_stats ats
LEFT JOIN combined_response_times crt ON ats.admin_id = crt.admin_id
LEFT JOIN admin_resolution_times rest ON ats.admin_id = rest.admin_id
ORDER BY ats.admin_name;

-- Update the date-filtered function to use the same logic
CREATE OR REPLACE FUNCTION public.get_admin_analytics_by_date_range(start_date date DEFAULT NULL::date, end_date date DEFAULT NULL::date)
RETURNS TABLE(admin_id uuid, admin_name text, email text, total_tickets_catered bigint, tickets_in_progress bigint, tickets_resolved bigint, tickets_escalated bigint, avg_response_time_hours numeric, avg_resolution_time_hours numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH admin_ticket_stats AS (
    SELECT 
      p.id as admin_id,
      p.full_name as admin_name,
      p.email,
      
      -- Total tickets catered and handled until resolution within date range (excluding referred tickets)
      COUNT(CASE 
        WHEN t.assigned_admin_id = p.id 
        AND (start_date IS NULL OR DATE(t.created_at) >= start_date)
        AND (end_date IS NULL OR DATE(t.created_at) <= end_date)
        AND NOT EXISTS (
          SELECT 1 FROM ticket_referrals tr 
          WHERE tr.ticket_id = t.id 
          AND tr.referring_admin_id = p.id 
          AND tr.status = 'accepted'
        )
        THEN 1 END) as total_tickets_catered,
      
      -- Tickets in progress within date range (only those not referred)
      COUNT(CASE 
        WHEN t.assigned_admin_id = p.id 
        AND t.status = 'In Progress'
        AND (start_date IS NULL OR DATE(t.created_at) >= start_date)
        AND (end_date IS NULL OR DATE(t.created_at) <= end_date)
        AND NOT EXISTS (
          SELECT 1 FROM ticket_referrals tr 
          WHERE tr.ticket_id = t.id 
          AND tr.referring_admin_id = p.id 
          AND tr.status = 'accepted'
        )
        THEN 1 END) as tickets_in_progress,
      
      -- Tickets resolved within date range (only those handled until resolution)
      COUNT(CASE 
        WHEN t.assigned_admin_id = p.id 
        AND t.status IN ('Resolved', 'Closed')
        AND (start_date IS NULL OR DATE(t.created_at) >= start_date)
        AND (end_date IS NULL OR DATE(t.created_at) <= end_date)
        AND NOT EXISTS (
          SELECT 1 FROM ticket_referrals tr 
          WHERE tr.ticket_id = t.id 
          AND tr.referring_admin_id = p.id 
          AND tr.status = 'accepted'
        )
        THEN 1 END) as tickets_resolved,
      
      -- Tickets escalated within date range - deduplicated
      COUNT(DISTINCT CASE 
        WHEN tr.referring_admin_id = p.id 
        AND tr.status = 'accepted'
        AND (start_date IS NULL OR DATE(tr.created_at) >= start_date)
        AND (end_date IS NULL OR DATE(tr.created_at) <= end_date)
        THEN tr.ticket_id END) as tickets_escalated
      
    FROM profiles p
    LEFT JOIN tickets t ON t.assigned_admin_id = p.id
    LEFT JOIN ticket_referrals tr ON tr.referring_admin_id = p.id
    WHERE p.is_admin = true
    GROUP BY p.id, p.full_name, p.email
  ),
  -- Initial response times for ALL admins within date range (including those who later referred)
  filtered_initial_response_times AS (
    SELECT 
      ta_first.user_id as admin_id,
      AVG(
        CASE 
          WHEN ta_first.created_at IS NOT NULL AND t.created_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (ta_first.created_at - t.created_at)) / 3600.0
          ELSE NULL
        END
      ) as avg_initial_response_time_hours,
      COUNT(*) as initial_response_count
    FROM tickets t
    JOIN (
      SELECT DISTINCT ON (ticket_id) 
        ticket_id, 
        created_at,
        user_id
      FROM ticket_activities 
      WHERE activity_type = 'assigned'
      ORDER BY ticket_id, created_at ASC
    ) ta_first ON ta_first.ticket_id = t.id
    WHERE ta_first.user_id IS NOT NULL
    AND (start_date IS NULL OR DATE(t.created_at) >= start_date)
    AND (end_date IS NULL OR DATE(t.created_at) <= end_date)
    GROUP BY ta_first.user_id
  ),
  -- Referral acceptance times within date range
  filtered_referral_acceptance_times AS (
    SELECT 
      tr.referred_admin_id as admin_id,
      AVG(
        CASE 
          WHEN ta_accepted.created_at IS NOT NULL AND tr.created_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (ta_accepted.created_at - tr.created_at)) / 3600.0
          ELSE NULL
        END
      ) as avg_referral_response_time_hours,
      COUNT(*) as referral_response_count
    FROM ticket_referrals tr
    JOIN ticket_activities ta_accepted ON (
      ta_accepted.ticket_id = tr.ticket_id 
      AND ta_accepted.activity_type = 'referral_accepted'
      AND ta_accepted.user_id = tr.referred_admin_id
      AND ta_accepted.created_at >= tr.created_at
    )
    WHERE tr.status = 'accepted'
    AND (start_date IS NULL OR DATE(tr.created_at) >= start_date)
    AND (end_date IS NULL OR DATE(tr.created_at) <= end_date)
    GROUP BY tr.referred_admin_id
  ),
  -- Combined response times with date filtering
  filtered_combined_response_times AS (
    SELECT 
      COALESCE(firt.admin_id, frat.admin_id) as admin_id,
      CASE 
        -- If admin has both initial and referral response times, calculate weighted average
        WHEN firt.avg_initial_response_time_hours IS NOT NULL AND frat.avg_referral_response_time_hours IS NOT NULL
        THEN (
          (firt.avg_initial_response_time_hours * firt.initial_response_count) + 
          (frat.avg_referral_response_time_hours * frat.referral_response_count)
        ) / (firt.initial_response_count + frat.referral_response_count)
        -- If admin only has initial response time (includes those who referred tickets)
        WHEN firt.avg_initial_response_time_hours IS NOT NULL
        THEN firt.avg_initial_response_time_hours
        -- If admin only has referral acceptance response time
        WHEN frat.avg_referral_response_time_hours IS NOT NULL
        THEN frat.avg_referral_response_time_hours
        ELSE 0
      END as avg_response_time_hours
    FROM filtered_initial_response_times firt
    FULL OUTER JOIN filtered_referral_acceptance_times frat ON firt.admin_id = frat.admin_id
  ),
  -- Resolution times within date range for tickets that admins resolved
  filtered_resolution_times AS (
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
    AND (start_date IS NULL OR DATE(t.created_at) >= start_date)
    AND (end_date IS NULL OR DATE(t.created_at) <= end_date)
    -- Only include tickets that were resolved by this admin (not referred to others)
    AND NOT EXISTS (
      SELECT 1 FROM ticket_referrals tr 
      WHERE tr.ticket_id = t.id 
      AND tr.referring_admin_id = t.assigned_admin_id 
      AND tr.status = 'accepted'
    )
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
    ROUND(COALESCE(fcrt.avg_response_time_hours, 0), 6) as avg_response_time_hours,
    ROUND(COALESCE(frest.avg_resolution_time_hours, 0), 6) as avg_resolution_time_hours
  FROM admin_ticket_stats ats
  LEFT JOIN filtered_combined_response_times fcrt ON ats.admin_id = fcrt.admin_id
  LEFT JOIN filtered_resolution_times frest ON ats.admin_id = frest.admin_id
  ORDER BY ats.admin_name;
END;
$$;

-- Update summary stats to properly calculate averages with all admin contributions
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
    -- Simple average of all admins' response times (includes all admin contributions)
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
