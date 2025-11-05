
-- Fix the check constraint to allow 'Closed' status
ALTER TABLE public.tickets 
DROP CONSTRAINT IF EXISTS tickets_status_check;

-- Add the updated constraint with 'Closed' included
ALTER TABLE public.tickets 
ADD CONSTRAINT tickets_status_check 
CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed'));
