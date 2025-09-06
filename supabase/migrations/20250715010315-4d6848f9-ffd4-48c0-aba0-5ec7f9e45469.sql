-- Enable real-time for ticket_messages table
ALTER TABLE public.ticket_messages REPLICA IDENTITY FULL;

-- Add ticket_messages to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;