
-- Update the ticket_activities constraint to include 'details_updated' activity type
ALTER TABLE public.ticket_activities DROP CONSTRAINT IF EXISTS ticket_activities_activity_type_check;

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
  'details_updated'
));
