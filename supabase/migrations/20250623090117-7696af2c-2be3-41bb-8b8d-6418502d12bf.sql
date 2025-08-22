
-- Create ticket_messages table for real-time chat functionality
CREATE TABLE public.ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ticket messages
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for ticket messages
CREATE POLICY "Users can view messages for their tickets" 
  ON public.ticket_messages 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.tickets 
    WHERE tickets.id = ticket_messages.ticket_id 
    AND tickets.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all ticket messages" 
  ON public.ticket_messages 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  ));

CREATE POLICY "Users can create messages for their tickets" 
  ON public.ticket_messages 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tickets 
    WHERE tickets.id = ticket_messages.ticket_id 
    AND tickets.user_id = auth.uid()
  ));

CREATE POLICY "Admins can create messages for any ticket" 
  ON public.ticket_messages 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  ));

-- Enable real-time for ticket messages
ALTER TABLE public.ticket_messages REPLICA IDENTITY FULL;
