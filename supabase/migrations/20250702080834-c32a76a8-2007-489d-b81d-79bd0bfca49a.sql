
-- Update the ticket_activities constraint to include all activity types used by the application
ALTER TABLE public.ticket_activities DROP CONSTRAINT IF EXISTS ticket_activities_activity_type_check;

-- Add the updated constraint with all required activity types
ALTER TABLE public.ticket_activities ADD CONSTRAINT ticket_activities_activity_type_check 
CHECK (activity_type IN (
  'created',
  'status_changed', 
  'assigned',
  'resolved',
  'referred',
  'referral_accepted',
  'referral_declined',
  'message_sent',
  'attachment_added',
  'closed',
  'details_updated',
  'comment',
  'escalated_to_infosoft',
  'escalation_resolved',
  'referral_withdrawn'
));

-- Create trigger for logging infosoft escalation activities
CREATE OR REPLACE FUNCTION public.log_infosoft_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_profile RECORD;
  ticket_info RECORD;
BEGIN
  -- Get admin and ticket details
  SELECT full_name, department_code INTO admin_profile
  FROM public.profiles WHERE id = NEW.escalated_by_admin_id;
  
  SELECT ticket_number, title INTO ticket_info
  FROM public.tickets WHERE id = NEW.ticket_id;

  IF TG_OP = 'INSERT' THEN
    -- Log escalation creation
    INSERT INTO public.ticket_activities (
      ticket_id,
      user_id,
      activity_type,
      description,
      admin_name,
      department_code
    ) VALUES (
      NEW.ticket_id,
      NEW.escalated_by_admin_id,
      'escalated_to_infosoft',
      'Ticket escalated to Infosoft Dev by ' || COALESCE(admin_profile.full_name, 'admin'),
      COALESCE(admin_profile.full_name, 'Unknown Admin'),
      COALESCE(admin_profile.department_code, 'Unknown')
    );
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'resolved' THEN
    -- Log escalation resolution
    INSERT INTO public.ticket_activities (
      ticket_id,
      user_id,
      activity_type,
      description,
      admin_name,
      department_code
    ) VALUES (
      NEW.ticket_id,
      NEW.escalated_by_admin_id,
      'escalation_resolved',
      'Infosoft Dev escalation resolved by ' || COALESCE(admin_profile.full_name, 'admin'),
      COALESCE(admin_profile.full_name, 'Unknown Admin'),
      COALESCE(admin_profile.department_code, 'Unknown')
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_log_infosoft_escalation ON public.infosoft_escalations;
CREATE TRIGGER trigger_log_infosoft_escalation
  AFTER INSERT OR UPDATE ON public.infosoft_escalations
  FOR EACH ROW
  EXECUTE FUNCTION log_infosoft_escalation();
