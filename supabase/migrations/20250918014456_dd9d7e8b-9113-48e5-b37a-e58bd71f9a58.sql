-- Create table to track user notification views across browsers/devices
CREATE TABLE public.user_notification_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  last_message_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_status_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, ticket_id)
);

-- Enable RLS
ALTER TABLE public.user_notification_views ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own notification views" 
ON public.user_notification_views 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notification views" 
ON public.user_notification_views 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification views" 
ON public.user_notification_views 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_notification_view_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_notification_views_updated_at
BEFORE UPDATE ON public.user_notification_views
FOR EACH ROW
EXECUTE FUNCTION public.update_notification_view_timestamp();

-- Create indexes for better performance
CREATE INDEX idx_user_notification_views_user_id ON public.user_notification_views(user_id);
CREATE INDEX idx_user_notification_views_ticket_id ON public.user_notification_views(ticket_id);
CREATE INDEX idx_user_notification_views_user_ticket ON public.user_notification_views(user_id, ticket_id);