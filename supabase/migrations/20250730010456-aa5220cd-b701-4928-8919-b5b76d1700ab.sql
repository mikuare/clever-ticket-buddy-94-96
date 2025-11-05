-- Insert default branding images for slideshow (bypass RLS using service role context)
INSERT INTO public.branding_images (name, image_url, image_type, display_order, is_active, created_by) VALUES
('Background Image 1', '/lovable-uploads/cceef45f-bf3d-4bc5-9651-70397108a146.png', 'background', 1, true, (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1)),
('Background Image 2', '/lovable-uploads/bbcaed06-9a97-41a7-b55f-7e09c6b998df.png', 'background', 2, true, (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1)),
('Background Image 3', '/lovable-uploads/3ebb3991-5797-49d3-bbbe-d35d0beb24b3.png', 'background', 3, true, (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1)),
('Background Image 4', '/lovable-uploads/0268d849-61ca-43f1-a6ed-69265d9c5ae9.png', 'background', 4, true, (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1)),
('Company Logo', '/lovable-uploads/cb6eca2d-a768-478b-af7f-1c3fba8f1b6c.png', 'logo', 1, true, (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1));