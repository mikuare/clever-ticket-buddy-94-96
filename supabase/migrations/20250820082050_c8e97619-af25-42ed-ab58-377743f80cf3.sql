-- Create department authorization keys table
CREATE TABLE public.department_auth_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_code TEXT NOT NULL UNIQUE,
  auth_key TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.department_auth_keys ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view department auth requirements" 
ON public.department_auth_keys 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage department auth keys" 
ON public.department_auth_keys 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() AND is_admin = true
));

-- Insert default admin key for ADM department
INSERT INTO public.department_auth_keys (department_code, auth_key)
VALUES ('ADM', 'admin123');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_department_auth_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_department_auth_keys_updated_at
BEFORE UPDATE ON public.department_auth_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_department_auth_keys_updated_at();