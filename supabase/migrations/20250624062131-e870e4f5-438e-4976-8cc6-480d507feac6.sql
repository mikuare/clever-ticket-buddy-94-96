
-- Create a table to track user presence in real-time
CREATE TABLE IF NOT EXISTS public.user_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  department_code TEXT NOT NULL,
  full_name TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index to prevent duplicate entries per user
CREATE UNIQUE INDEX IF NOT EXISTS user_presence_user_id_idx ON public.user_presence(user_id);

-- Enable RLS
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Create policies for user presence
CREATE POLICY "Anyone can view user presence" 
  ON public.user_presence 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own presence" 
  ON public.user_presence 
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view and manage all presence" 
  ON public.user_presence 
  FOR ALL
  USING (public.is_user_admin(auth.uid()));

-- Enable realtime for user_presence table
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;

-- Create function to update user presence
CREATE OR REPLACE FUNCTION public.update_user_presence(
  p_user_id UUID,
  p_is_online BOOLEAN,
  p_department_code TEXT,
  p_full_name TEXT,
  p_is_admin BOOLEAN DEFAULT false
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_presence (user_id, is_online, department_code, full_name, is_admin, last_seen, updated_at)
  VALUES (p_user_id, p_is_online, p_department_code, p_full_name, p_is_admin, now(), now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_online = p_is_online,
    last_seen = now(),
    updated_at = now(),
    department_code = p_department_code,
    full_name = p_full_name,
    is_admin = p_is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix admin policies to ensure they can see all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.is_user_admin(auth.uid()) OR id = auth.uid());
