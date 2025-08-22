-- Create IT Team table similar to digitalization_team
CREATE TABLE public.it_team (
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
ALTER TABLE public.it_team ENABLE ROW LEVEL SECURITY;

-- Create policies for IT team
CREATE POLICY "Admins can manage IT team members" 
ON public.it_team 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.is_admin = true
));

CREATE POLICY "Everyone can view active IT team members" 
ON public.it_team 
FOR SELECT 
USING (is_active = true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_it_team_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_it_team_updated_at
BEFORE UPDATE ON public.it_team
FOR EACH ROW
EXECUTE FUNCTION public.update_it_team_updated_at();

-- Insert the IT team members
INSERT INTO public.it_team (name, image_url, job_title, display_order, is_active) VALUES
('Dexter Camarillo', '/lovable-uploads/67e5a61b-6f44-4465-a77e-c2d0cba4046f.png', 'IT Support II', 1, true),
('Alfonso Perater', '/lovable-uploads/67e5a61b-6f44-4465-a77e-c2d0cba4046f.png', 'IT Support', 2, true);