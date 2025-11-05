
-- Update the manage_user_suspension function to allow cross-department suspensions for normal users
CREATE OR REPLACE FUNCTION public.manage_user_suspension(
  p_user_id uuid,
  p_suspend boolean,
  p_reason text DEFAULT NULL,
  p_admin_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_profile RECORD;
  user_profile RECORD;
BEGIN
  -- Get admin profile
  SELECT * INTO admin_profile
  FROM public.profiles 
  WHERE id = p_admin_id AND is_admin = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only admins can manage user suspensions';
  END IF;
  
  -- Get user profile
  SELECT * INTO user_profile
  FROM public.profiles 
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Prevent self-suspension
  IF p_user_id = p_admin_id THEN
    RAISE EXCEPTION 'Admins cannot suspend themselves';
  END IF;
  
  -- Prevent suspending other admins (regardless of department)
  IF user_profile.is_admin = true THEN
    RAISE EXCEPTION 'Cannot suspend other admin users';
  END IF;
  
  -- Update suspension status
  IF p_suspend THEN
    UPDATE public.profiles 
    SET 
      is_suspended = true,
      suspended_at = NOW(),
      suspended_by = p_admin_id,
      suspension_reason = p_reason,
      updated_at = NOW()
    WHERE id = p_user_id;
  ELSE
    UPDATE public.profiles 
    SET 
      is_suspended = false,
      suspended_at = NULL,
      suspended_by = NULL,
      suspension_reason = NULL,
      updated_at = NOW()
    WHERE id = p_user_id;
  END IF;
  
  RETURN true;
END;
$$;

-- Update the RLS policy to allow admins to manage suspensions across departments for non-admin users
DROP POLICY IF EXISTS "Admins can manage suspensions in their department" ON public.profiles;
CREATE POLICY "Admins can manage suspensions for non-admin users" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.is_admin = true
  ) 
  AND profiles.is_admin = false
);
