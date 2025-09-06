-- Enable real-time for post_reactions table
ALTER TABLE public.post_reactions REPLICA IDENTITY FULL;

-- Add the table to the real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_reactions;