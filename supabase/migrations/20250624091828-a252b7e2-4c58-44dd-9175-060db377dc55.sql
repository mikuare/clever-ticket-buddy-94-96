
-- Create the ticket_referrals table
CREATE TABLE public.ticket_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  referring_admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.ticket_referrals ENABLE ROW LEVEL SECURITY;

-- Create policies for ticket referrals
CREATE POLICY "Admins can view referrals they're involved in" 
  ON public.ticket_referrals 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    ) AND (
      referring_admin_id = auth.uid() OR 
      referred_admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create referrals" 
  ON public.ticket_referrals 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    ) AND referring_admin_id = auth.uid()
  );

CREATE POLICY "Referred admins can update referral status" 
  ON public.ticket_referrals 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    ) AND referred_admin_id = auth.uid()
  );

-- Create indexes for better performance
CREATE INDEX idx_ticket_referrals_ticket_id ON public.ticket_referrals(ticket_id);
CREATE INDEX idx_ticket_referrals_referring_admin_id ON public.ticket_referrals(referring_admin_id);
CREATE INDEX idx_ticket_referrals_referred_admin_id ON public.ticket_referrals(referred_admin_id);
CREATE INDEX idx_ticket_referrals_status ON public.ticket_referrals(status);

-- Enable realtime for ticket_referrals
ALTER TABLE public.ticket_referrals REPLICA IDENTITY FULL;
