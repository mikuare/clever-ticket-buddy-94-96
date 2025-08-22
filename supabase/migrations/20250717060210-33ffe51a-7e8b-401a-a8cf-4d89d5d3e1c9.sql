
-- Create table for digitalization team members
CREATE TABLE public.digitalization_team (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  facebook_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the current team members data
INSERT INTO public.digitalization_team (name, image_url, facebook_url, display_order) VALUES
('Jude Michael M. Martinez', '/lovable-uploads/4add0ce5-86c0-4110-b480-513559724f58.png', 'https://www.facebook.com/judeTech28', 1),
('Christoper Ed', '/lovable-uploads/b80a3dbd-c05a-4f35-b259-be8bc9e3fcd0.png', 'https://www.facebook.com/edcristopher', 2),
('Han Christian B. Pacaña', '/lovable-uploads/f0f8cfc0-31ee-44bf-b345-fad0f72de594.png', 'https://www.facebook.com/hanchristian.pacana', 3),
('Patrick Castillo Erojo', '/lovable-uploads/7612f37d-b830-44a1-97ca-14d35e43384f.png', 'https://www.facebook.com/patrick.castillo.erojo', 4);

-- Enable Row Level Security
ALTER TABLE public.digitalization_team ENABLE ROW LEVEL SECURITY;

-- Create policies for the table
-- Allow everyone to view active team members
CREATE POLICY "Everyone can view active team members" 
  ON public.digitalization_team 
  FOR SELECT 
  USING (is_active = true);

-- Allow admins to manage team members
CREATE POLICY "Admins can manage team members" 
  ON public.digitalization_team 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_digitalization_team_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER digitalization_team_updated_at
  BEFORE UPDATE ON public.digitalization_team
  FOR EACH ROW
  EXECUTE FUNCTION update_digitalization_team_updated_at();
