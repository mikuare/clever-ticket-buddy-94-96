
-- Create storage bucket for ticket attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ticket-attachments', 'ticket-attachments', true);

-- Create policy for authenticated users to upload files
CREATE POLICY "Authenticated users can upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'ticket-attachments' AND 
  auth.role() = 'authenticated'
);

-- Create policy for authenticated users to view files
CREATE POLICY "Authenticated users can view files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'ticket-attachments' AND 
  auth.role() = 'authenticated'
);

-- Create policy for users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'ticket-attachments' AND 
  auth.role() = 'authenticated'
);
