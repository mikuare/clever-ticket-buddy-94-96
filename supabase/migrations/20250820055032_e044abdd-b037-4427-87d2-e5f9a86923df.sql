-- Create maintenance_sessions table
CREATE TABLE public.maintenance_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'System Under Maintenance',
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  is_immediate BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maintenance_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Only admins can manage maintenance sessions"
ON public.maintenance_sessions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Everyone can view active maintenance sessions"
ON public.maintenance_sessions
FOR SELECT
USING (is_active = true);

-- Function to check if system is in maintenance mode
CREATE OR REPLACE FUNCTION public.is_system_in_maintenance()
RETURNS TABLE(
  in_maintenance BOOLEAN,
  maintenance_title TEXT,
  maintenance_description TEXT,
  maintenance_end_time TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN true 
      ELSE false 
    END as in_maintenance,
    COALESCE(MAX(ms.title), 'System Under Maintenance') as maintenance_title,
    MAX(ms.description) as maintenance_description,
    MAX(ms.end_time) as maintenance_end_time
  FROM public.maintenance_sessions ms
  WHERE ms.is_active = true
  AND (
    ms.is_immediate = true 
    OR (
      ms.start_time <= NOW() 
      AND (ms.end_time IS NULL OR ms.end_time > NOW())
    )
  );
END;
$$;

-- Function to auto-disable expired scheduled maintenance sessions
CREATE OR REPLACE FUNCTION public.disable_expired_maintenance_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.maintenance_sessions 
  SET 
    is_active = false,
    updated_at = NOW()
  WHERE 
    is_active = true 
    AND is_immediate = false
    AND end_time IS NOT NULL 
    AND end_time <= NOW();
END;
$$;

-- Function to enable immediate maintenance mode
CREATE OR REPLACE FUNCTION public.enable_immediate_maintenance(
  p_title TEXT DEFAULT 'System Under Maintenance',
  p_description TEXT DEFAULT NULL,
  p_admin_id UUID DEFAULT auth.uid()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_id UUID;
  admin_profile RECORD;
BEGIN
  -- Verify admin permissions
  SELECT * INTO admin_profile
  FROM public.profiles 
  WHERE id = p_admin_id AND is_admin = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only admins can enable maintenance mode';
  END IF;

  -- Disable any existing active maintenance sessions
  UPDATE public.maintenance_sessions 
  SET is_active = false, updated_at = NOW()
  WHERE is_active = true;

  -- Create new immediate maintenance session
  INSERT INTO public.maintenance_sessions (
    title,
    description,
    is_immediate,
    is_active,
    created_by
  ) VALUES (
    p_title,
    p_description,
    true,
    true,
    p_admin_id
  ) RETURNING id INTO session_id;

  RETURN session_id;
END;
$$;

-- Function to disable immediate maintenance mode
CREATE OR REPLACE FUNCTION public.disable_immediate_maintenance(
  p_admin_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_profile RECORD;
BEGIN
  -- Verify admin permissions
  SELECT * INTO admin_profile
  FROM public.profiles 
  WHERE id = p_admin_id AND is_admin = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only admins can disable maintenance mode';
  END IF;

  -- Disable immediate maintenance sessions
  UPDATE public.maintenance_sessions 
  SET 
    is_active = false,
    updated_at = NOW()
  WHERE 
    is_active = true 
    AND is_immediate = true;

  RETURN true;
END;
$$;

-- Function to schedule maintenance session
CREATE OR REPLACE FUNCTION public.schedule_maintenance_session(
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE,
  p_admin_id UUID DEFAULT auth.uid()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_id UUID;
  admin_profile RECORD;
BEGIN
  -- Verify admin permissions
  SELECT * INTO admin_profile
  FROM public.profiles 
  WHERE id = p_admin_id AND is_admin = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only admins can schedule maintenance sessions';
  END IF;

  -- Validate time inputs
  IF p_start_time IS NULL THEN
    RAISE EXCEPTION 'Start time is required for scheduled maintenance';
  END IF;

  IF p_end_time IS NOT NULL AND p_end_time <= p_start_time THEN
    RAISE EXCEPTION 'End time must be after start time';
  END IF;

  -- Create scheduled maintenance session
  INSERT INTO public.maintenance_sessions (
    title,
    description,
    start_time,
    end_time,
    is_immediate,
    is_active,
    created_by
  ) VALUES (
    p_title,
    p_description,
    p_start_time,
    p_end_time,
    false,
    true,
    p_admin_id
  ) RETURNING id INTO session_id;

  RETURN session_id;
END;
$$;

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_maintenance_sessions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_maintenance_sessions_updated_at
  BEFORE UPDATE ON public.maintenance_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_maintenance_sessions_updated_at();