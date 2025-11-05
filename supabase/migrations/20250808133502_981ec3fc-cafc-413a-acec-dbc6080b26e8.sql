-- Add audio fields to ticket_messages table
ALTER TABLE public.ticket_messages 
ADD COLUMN audio_url TEXT,
ADD COLUMN audio_duration INTEGER;