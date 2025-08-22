
-- Create a table to store branding/logo images
CREATE TABLE public.branding_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  image_type VARCHAR(50) NOT NULL DEFAULT 'logo',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.branding_images ENABLE ROW LEVEL SECURITY;

-- Create policies for branding images
CREATE POLICY "Everyone can view active branding images"
  ON public.branding_images
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage branding images"
  ON public.branding_images
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create an updated_at trigger
CREATE OR REPLACE FUNCTION update_branding_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_branding_images_updated_at
  BEFORE UPDATE ON public.branding_images
  FOR EACH ROW
  EXECUTE FUNCTION update_branding_images_updated_at();
