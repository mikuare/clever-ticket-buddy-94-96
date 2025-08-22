
-- First, let's check what activity types are currently allowed
-- and update the constraint to include all the activity types we need

-- Drop the existing constraint
ALTER TABLE public.ticket_activities DROP CONSTRAINT IF EXISTS ticket_activities_activity_type_check;

-- Add a new constraint with all the activity types we need
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
  'closed'
));
