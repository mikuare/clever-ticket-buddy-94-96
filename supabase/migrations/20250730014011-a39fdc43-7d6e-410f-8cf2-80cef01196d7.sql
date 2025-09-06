-- Create brand_logos table
CREATE TABLE public.brand_logos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.brand_logos ENABLE ROW LEVEL SECURITY;

-- Create policies for brand logos
CREATE POLICY "Everyone can view active brand logos" 
ON public.brand_logos 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage brand logos" 
ON public.brand_logos 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.is_admin = true
));

-- Create trigger for updated_at
CREATE TRIGGER update_brand_logos_updated_at
BEFORE UPDATE ON public.brand_logos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default brand logo
INSERT INTO public.brand_logos (name, image_url, is_active, display_order, created_by) VALUES
('QMAZ Holdings Logo', '/lovable-uploads/cb6eca2d-a768-478b-af7f-1c3fba8f1b6c.png', true, 1, (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1));