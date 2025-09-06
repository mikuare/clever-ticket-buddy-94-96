
-- Create a table to permanently store admin performance metrics
CREATE TABLE public.admin_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  ticket_id UUID NOT NULL,
  ticket_number TEXT NOT NULL,
  response_time_hours NUMERIC(10,2),
  resolution_time_hours NUMERIC(10,2),
  ticket_priority TEXT,
  department_code TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_admin_performance_admin_id ON public.admin_performance_metrics(admin_id);
CREATE INDEX idx_admin_performance_resolved_at ON public.admin_performance_metrics(resolved_at);

-- Create a function to capture performance metrics when tickets are resolved
CREATE OR REPLACE FUNCTION public.capture_admin_performance_metrics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response_time_calc NUMERIC;
  resolution_time_calc NUMERIC;
  assignment_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Only capture metrics when a ticket is being resolved (status changed to 'Resolved')
  IF TG_OP = 'UPDATE' AND OLD.status != 'Resolved' AND NEW.status = 'Resolved' AND NEW.assigned_admin_id IS NOT NULL THEN
    
    -- Get the assignment time from ticket activities
    SELECT MIN(created_at) INTO assignment_time
    FROM public.ticket_activities 
    WHERE ticket_id = NEW.id 
    AND activity_type = 'assigned';
    
    -- If no assignment activity found, use updated_at as fallback
    IF assignment_time IS NULL THEN
      assignment_time := NEW.updated_at;
    END IF;
    
    -- Calculate response time (ticket creation to assignment) in hours
    response_time_calc := EXTRACT(EPOCH FROM (assignment_time - NEW.created_at)) / 3600.0;
    
    -- Calculate resolution time (assignment to resolution) in hours
    resolution_time_calc := EXTRACT(EPOCH FROM (NEW.admin_resolved_at - assignment_time)) / 3600.0;
    
    -- Insert the performance metrics record
    INSERT INTO public.admin_performance_metrics (
      admin_id,
      ticket_id,
      ticket_number,
      response_time_hours,
      resolution_time_hours,
      ticket_priority,
      department_code,
      resolved_at
    ) VALUES (
      NEW.assigned_admin_id,
      NEW.id,
      NEW.ticket_number,
      GREATEST(response_time_calc, 0), -- Ensure no negative values
      GREATEST(resolution_time_calc, 0), -- Ensure no negative values
      NEW.priority,
      NEW.department_code,
      NEW.admin_resolved_at
    );
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to capture performance metrics
DROP TRIGGER IF EXISTS capture_admin_performance_trigger ON public.tickets;
CREATE TRIGGER capture_admin_performance_trigger
  AFTER UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.capture_admin_performance_metrics();

-- Update the admin analytics view to use permanent metrics data
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
)
SELECT 
  ats.admin_id,
  ats.admin_name,
  ats.email,
  COALESCE(ats.total_tickets_catered, 0) as total_tickets_catered,
  COALESCE(ats.tickets_in_progress, 0) as tickets_in_progress,
  COALESCE(ats.tickets_resolved, 0) as tickets_resolved,
  COALESCE(ats.tickets_escalated, 0) as tickets_escalated,
  ROUND(COALESCE(aps.avg_response_time_hours, 0), 2) as avg_response_time_hours,
  ROUND(COALESCE(aps.avg_resolution_time_hours, 0), 2) as avg_resolution_time_hours
FROM admin_ticket_stats ats
LEFT JOIN admin_performance_stats aps ON ats.admin_id = aps.admin_id
ORDER BY ats.admin_name;

-- Update the summary stats function to use permanent metrics
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

-- Backfill existing resolved tickets data (optional - run this if you want to capture historical data)
INSERT INTO public.admin_performance_metrics (
  admin_id,
  ticket_id,
  ticket_number,
  response_time_hours,
  resolution_time_hours,
  ticket_priority,
  department_code,
  resolved_at
)
SELECT 
  t.assigned_admin_id,
  t.id,
  t.ticket_number,
  GREATEST(
    EXTRACT(EPOCH FROM (
      COALESCE(
        (SELECT MIN(created_at) FROM ticket_activities WHERE ticket_id = t.id AND activity_type = 'assigned'),
        t.updated_at
      ) - t.created_at
    )) / 3600.0,
    0
  ) as response_time_hours,
  GREATEST(
    EXTRACT(EPOCH FROM (
      t.admin_resolved_at - COALESCE(
        (SELECT MIN(created_at) FROM ticket_activities WHERE ticket_id = t.id AND activity_type = 'assigned'),
        t.updated_at
      )
    )) / 3600.0,
    0
  ) as resolution_time_hours,
  t.priority,
  t.department_code,
  t.admin_resolved_at
FROM tickets t
WHERE t.admin_resolved_at IS NOT NULL 
  AND t.assigned_admin_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.admin_performance_metrics 
    WHERE ticket_id = t.id
  );
