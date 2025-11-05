
-- Update the auto-close function to use 24 hours instead of 10 minutes
CREATE OR REPLACE FUNCTION auto_close_resolved_tickets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.tickets 
  SET 
    status = 'Closed',
    user_closed_at = now(),
    updated_at = now()
  WHERE 
    status = 'Resolved' 
    AND admin_resolved_at IS NOT NULL
    AND admin_resolved_at < (now() - INTERVAL '24 hours')
    AND user_closed_at IS NULL;
END;
$$;
