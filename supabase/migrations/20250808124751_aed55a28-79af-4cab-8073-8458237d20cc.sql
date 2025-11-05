-- Create a table to track reaction cooldowns
CREATE TABLE public.reaction_cooldowns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  last_removal_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.reaction_cooldowns ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to manage their own cooldowns
CREATE POLICY "Users can manage their own reaction cooldowns" 
  ON public.reaction_cooldowns 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to check if user is in cooldown period
CREATE OR REPLACE FUNCTION public.check_reaction_cooldown(p_user_id uuid, p_post_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_removal TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get the last removal time for this user and post
  SELECT last_removal_at INTO last_removal
  FROM public.reaction_cooldowns
  WHERE user_id = p_user_id AND post_id = p_post_id;
  
  -- If no previous removal, user is not in cooldown
  IF last_removal IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if 1 minute has passed since last removal
  RETURN (NOW() - last_removal) < INTERVAL '1 minute';
END;
$$;