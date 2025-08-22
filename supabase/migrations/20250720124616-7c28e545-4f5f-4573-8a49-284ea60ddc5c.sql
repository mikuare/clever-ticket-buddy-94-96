-- Create storage bucket for digitalization team images
INSERT INTO storage.buckets (id, name, public) VALUES ('digitalization-team-images', 'digitalization-team-images', true);

-- Create storage policies for digitalization team images
CREATE POLICY "Public can view team images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'digitalization-team-images');

CREATE POLICY "Admins can upload team images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'digitalization-team-images' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can update team images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'digitalization-team-images' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can delete team images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'digitalization-team-images' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);