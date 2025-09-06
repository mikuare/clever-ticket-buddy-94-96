
-- Create storage bucket for department images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('department-images', 'department-images', true);

-- Create policy for authenticated users to view department images
CREATE POLICY "Anyone can view department images" ON storage.objects
FOR SELECT USING (bucket_id = 'department-images');

-- Create policy for admins to upload department images
CREATE POLICY "Admins can upload department images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'department-images' AND 
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Create policy for admins to update department images
CREATE POLICY "Admins can update department images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'department-images' AND 
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Create policy for admins to delete department images
CREATE POLICY "Admins can delete department images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'department-images' AND 
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Add image_url column to departments table
ALTER TABLE public.departments 
ADD COLUMN image_url TEXT;

-- Add updated_at column to departments table for tracking changes
ALTER TABLE public.departments 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_departments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER departments_updated_at_trigger
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION update_departments_updated_at();
