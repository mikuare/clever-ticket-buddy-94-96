
-- Create a table to temporarily store password reset requests
CREATE TABLE public.password_reset_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 hour'),
  used BOOLEAN NOT NULL DEFAULT false
);

-- Add Row Level Security
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for the service role to manage password reset requests
CREATE POLICY "Service role can manage password reset requests" 
  ON public.password_reset_requests 
  FOR ALL 
  USING (true);

-- Create index for efficient lookups
CREATE INDEX idx_password_reset_requests_token ON public.password_reset_requests(token);
CREATE INDEX idx_password_reset_requests_email ON public.password_reset_requests(email);
CREATE INDEX idx_password_reset_requests_expires ON public.password_reset_requests(expires_at);

-- Function to clean up expired password reset requests
CREATE OR REPLACE FUNCTION public.cleanup_expired_password_resets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.password_reset_requests 
  WHERE expires_at < now() OR used = true;
END;
$$;
