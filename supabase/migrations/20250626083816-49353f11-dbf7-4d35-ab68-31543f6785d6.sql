
-- Add classification column to user_cooldowns table to support per-classification cooldowns
ALTER TABLE public.user_cooldowns 
ADD COLUMN classification text;

-- Update any existing rows to have a default classification
UPDATE public.user_cooldowns 
SET classification = 'General Inquiry' 
WHERE classification IS NULL;

-- Now make the column NOT NULL and add constraint
ALTER TABLE public.user_cooldowns 
ALTER COLUMN classification SET NOT NULL;

ALTER TABLE public.user_cooldowns 
ADD CONSTRAINT user_cooldowns_classification_not_empty 
CHECK (classification != '');

-- Create a unique constraint to ensure one cooldown record per user per classification
-- First drop the old unique constraint if it exists
ALTER TABLE public.user_cooldowns 
DROP CONSTRAINT IF EXISTS user_cooldowns_user_id_key;

-- Add the new composite unique constraint
ALTER TABLE public.user_cooldowns 
ADD CONSTRAINT user_cooldowns_user_classification_unique 
UNIQUE (user_id, classification);
