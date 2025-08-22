
-- Drop existing triggers if they exist to avoid conflicts
DROP TRIGGER IF EXISTS log_ticket_activity_trigger ON public.tickets;
DROP TRIGGER IF EXISTS log_referral_activity_trigger ON public.ticket_referrals;

-- Create trigger for ticket activities (INSERT and UPDATE)
CREATE TRIGGER log_ticket_activity_trigger
  AFTER INSERT OR UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.log_ticket_activity();

-- Create trigger for referral activities (INSERT and UPDATE)  
CREATE TRIGGER log_referral_activity_trigger
  AFTER INSERT OR UPDATE ON public.ticket_referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.log_referral_activity();
