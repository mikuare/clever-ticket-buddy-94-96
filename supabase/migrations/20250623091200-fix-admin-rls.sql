
-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing admin policies that might cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can update all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can view all activities" ON public.ticket_activities;

-- Recreate admin policies using the security definer function
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can view all tickets" 
  ON public.tickets 
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can update all tickets" 
  ON public.tickets 
  FOR UPDATE 
  USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Admins can view all activities" 
  ON public.ticket_activities 
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()));

-- Add missing RLS policies for ticket_messages
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
  USING (public.is_user_admin(auth.uid()));

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
  WITH CHECK (public.is_user_admin(auth.uid()));
