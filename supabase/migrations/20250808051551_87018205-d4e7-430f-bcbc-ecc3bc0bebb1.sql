-- Add resolution_notes field to tickets table to store resolution history
ALTER TABLE public.tickets 
ADD COLUMN resolution_notes JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.tickets.resolution_notes IS 'Array of resolution notes with admin details and timestamps';