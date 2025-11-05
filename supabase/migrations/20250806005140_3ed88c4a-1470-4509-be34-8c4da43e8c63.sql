-- Enable real-time for ticket_messages table
ALTER TABLE public.ticket_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;

-- Enable real-time for tickets table  
ALTER TABLE public.tickets REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;

-- Enable real-time for ticket_activities table
ALTER TABLE public.ticket_activities REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_activities;