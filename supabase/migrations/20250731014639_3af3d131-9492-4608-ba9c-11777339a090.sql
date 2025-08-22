-- Fix the ticket_referrals status check constraint to include 'withdrawn'
-- This will resolve the error when multiple admins are referred and one accepts

ALTER TABLE public.ticket_referrals 
DROP CONSTRAINT ticket_referrals_status_check;

ALTER TABLE public.ticket_referrals 
ADD CONSTRAINT ticket_referrals_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text, 'cancelled'::text, 'withdrawn'::text]));