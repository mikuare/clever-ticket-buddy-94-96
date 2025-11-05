-- Add reply and edit functionality to ticket_messages
ALTER TABLE public.ticket_messages 
ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES public.ticket_messages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN NOT NULL DEFAULT false;

-- Create index for reply_to for better performance
CREATE INDEX IF NOT EXISTS idx_ticket_messages_reply_to ON public.ticket_messages(reply_to);

-- Create typing_status table for real-time typing indicators
CREATE TABLE IF NOT EXISTS public.typing_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_typing BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ticket_id, user_id)
);

-- Enable RLS on typing_status
ALTER TABLE public.typing_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view typing status for their tickets" ON public.typing_status;
DROP POLICY IF EXISTS "Admins can view all typing status" ON public.typing_status;
DROP POLICY IF EXISTS "Users can manage their typing status for their tickets" ON public.typing_status;
DROP POLICY IF EXISTS "Admins can manage their typing status for any ticket" ON public.typing_status;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.ticket_messages;

-- Create policies for typing_status
CREATE POLICY "Users can view typing status for their tickets" 
  ON public.typing_status 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.tickets 
    WHERE tickets.id = typing_status.ticket_id 
    AND tickets.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all typing status" 
  ON public.typing_status 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  ));

CREATE POLICY "Users can manage their typing status for their tickets" 
  ON public.typing_status 
  FOR ALL 
  USING (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE tickets.id = typing_status.ticket_id 
      AND tickets.user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE tickets.id = typing_status.ticket_id 
      AND tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage their typing status for any ticket" 
  ON public.typing_status 
  FOR ALL 
  USING (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Enable real-time for typing_status
ALTER TABLE public.typing_status REPLICA IDENTITY FULL;

-- Add policy for users to update their own messages
CREATE POLICY "Users can update their own messages" 
  ON public.ticket_messages 
  FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create function to clean up old typing statuses (older than 30 seconds)
CREATE OR REPLACE FUNCTION public.cleanup_old_typing_status()
RETURNS void AS $$
BEGIN
  DELETE FROM public.typing_status
  WHERE updated_at < NOW() - INTERVAL '30 seconds';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index on updated_at for efficient cleanup
CREATE INDEX IF NOT EXISTS idx_typing_status_updated_at ON public.typing_status(updated_at);

