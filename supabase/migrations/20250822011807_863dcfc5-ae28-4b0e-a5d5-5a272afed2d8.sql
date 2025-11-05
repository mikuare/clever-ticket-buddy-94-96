-- Create admin ticket bookmarks table
CREATE TABLE public.admin_ticket_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  ticket_id UUID NOT NULL,
  bookmark_title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one bookmark per admin per ticket
  UNIQUE(admin_id, ticket_id)
);

-- Enable Row Level Security
ALTER TABLE public.admin_ticket_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies for admin bookmark access
CREATE POLICY "Admins can manage their own bookmarks" 
ON public.admin_ticket_bookmarks 
FOR ALL 
USING (admin_id = auth.uid() AND EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_admin = true
))
WITH CHECK (admin_id = auth.uid() AND EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_admin = true
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_admin_bookmarks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_admin_bookmarks_updated_at
  BEFORE UPDATE ON public.admin_ticket_bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_admin_bookmarks_updated_at();