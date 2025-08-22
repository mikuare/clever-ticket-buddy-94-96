-- Create digitalization team table with simplified structure
CREATE TABLE public.digitalization_team (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  job_title TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.digitalization_team ENABLE ROW LEVEL SECURITY;

-- Create policies for digitalization team access
CREATE POLICY "Everyone can view active team members" 
ON public.digitalization_team 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage team members" 
ON public.digitalization_team 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_admin = true
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_digitalization_team_updated_at
BEFORE UPDATE ON public.digitalization_team
FOR EACH ROW
EXECUTE FUNCTION public.update_digitalization_team_updated_at();

-- Insert sample team members using the static data from StaticDigitalizationTeam component
INSERT INTO public.digitalization_team (name, image_url, job_title, display_order) VALUES
('Patrick Castillo Erojo', '/lovable-uploads/7612f37d-b830-44a1-97ca-14d35e43384f.png', 'Digital System Analyst - Team Leader', 1),
('Jude Michael M. Martinez', '/lovable-uploads/4add0ce5-86c0-4110-b480-513559724f58.png', 'Digital System Database Analyst', 2),
('Christoper Ed', '/lovable-uploads/b80a3dbd-c05a-4f35-b259-be8bc9e3fcd0.png', 'Digital System Analyst Associate', 3),
('Han Christian B. Pacaña', '/lovable-uploads/f0f8cfc0-31ee-44bf-b345-fad0f72de594.png', 'Digital System Analyst Associate', 4);