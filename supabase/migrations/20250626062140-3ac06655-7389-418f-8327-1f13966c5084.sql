
-- Add column to track when a ticket was resolved by admin
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS admin_resolved_at timestamp with time zone;

-- Add column to track when user closed the ticket
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS user_closed_at timestamp with time zone;

-- Create a function to auto-close tickets after 10 minutes
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
    AND admin_resolved_at < (now() - INTERVAL '10 minutes')
    AND user_closed_at IS NULL;
END;
$$;

-- Create a trigger to set admin_resolved_at when status changes to 'Resolved'
CREATE OR REPLACE FUNCTION set_admin_resolved_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- If status is being changed to 'Resolved' and it wasn't resolved before
  IF NEW.status = 'Resolved' AND (OLD.status != 'Resolved' OR OLD.admin_resolved_at IS NULL) THEN
    NEW.admin_resolved_at = now();
  END IF;
  
  -- If status is being changed from 'Resolved' to something else, clear the timestamp
  IF OLD.status = 'Resolved' AND NEW.status != 'Resolved' THEN
    NEW.admin_resolved_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_set_admin_resolved_timestamp ON public.tickets;
CREATE TRIGGER trigger_set_admin_resolved_timestamp
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_admin_resolved_timestamp();
