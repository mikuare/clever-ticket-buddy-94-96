-- Add unique constraint on setting_key to prevent duplicates
ALTER TABLE public.system_settings 
ADD CONSTRAINT system_settings_setting_key_unique UNIQUE (setting_key);

-- Clean up any existing duplicates by keeping the most recent record for each setting_key
DELETE FROM public.system_settings s1 
WHERE s1.id NOT IN (
  SELECT DISTINCT ON (setting_key) id 
  FROM public.system_settings s2 
  ORDER BY setting_key, created_at DESC
);

-- Add RLS policy to allow authenticated users to read specific system settings
CREATE POLICY "Users can read auto-close and cooldown settings" 
ON public.system_settings 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND setting_key IN ('auto_close_hours', 'classification_cooldown_minutes')
);