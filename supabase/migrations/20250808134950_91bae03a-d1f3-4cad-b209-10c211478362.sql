-- Allow all users to view admin profiles (for avatar display in posts)
CREATE POLICY "Users can view admin profiles for avatars" 
ON public.profiles 
FOR SELECT 
USING (is_admin = true);