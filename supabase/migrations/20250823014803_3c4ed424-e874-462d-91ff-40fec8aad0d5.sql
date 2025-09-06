-- Create system settings table for auto-close configuration
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Only admins can manage system settings" 
ON public.system_settings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND is_admin = true
));

-- Insert default auto-close time setting (24 hours in hours)
INSERT INTO public.system_settings (setting_key, setting_value, description) 
VALUES ('auto_close_hours', '24', 'Number of hours after which resolved tickets are automatically closed');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_system_settings_updated_at();

-- Update the auto_close_resolved_tickets function to use configurable time
CREATE OR REPLACE FUNCTION public.auto_close_resolved_tickets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auto_close_hours INTEGER;
BEGIN
  -- Get the auto-close hours setting, default to 24 if not found
  SELECT COALESCE(setting_value::INTEGER, 24) INTO auto_close_hours
  FROM public.system_settings 
  WHERE setting_key = 'auto_close_hours';
  
  UPDATE public.tickets 
  SET 
    status = 'Closed',
    user_closed_at = now(),
    updated_at = now()
  WHERE 
    status = 'Resolved' 
    AND admin_resolved_at IS NOT NULL
    AND admin_resolved_at < (now() - (auto_close_hours || ' hours')::INTERVAL)
    AND user_closed_at IS NULL;
END;
$$;