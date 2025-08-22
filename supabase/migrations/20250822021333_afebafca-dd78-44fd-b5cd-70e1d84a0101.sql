
-- Drop the existing admin_ticket_bookmarks table and recreate with full ticket data
DROP TABLE IF EXISTS public.admin_ticket_bookmarks;

-- Create new admin_ticket_bookmarks table that stores complete ticket data
CREATE TABLE public.admin_ticket_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  original_ticket_id UUID NOT NULL,
  bookmark_title TEXT NOT NULL,
  
  -- Complete ticket data stored as a copy
  ticket_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  department_code TEXT NOT NULL,
  user_id UUID NOT NULL,
  assigned_admin_id UUID,
  assigned_admin_name TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  resolution_notes JSONB DEFAULT '[]'::jsonb,
  
  -- Original ticket timestamps
  ticket_created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ticket_updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  admin_resolved_at TIMESTAMP WITH TIME ZONE,
  user_closed_at TIMESTAMP WITH TIME ZONE,
  
  -- User information at time of bookmark
  user_full_name TEXT,
  user_email TEXT,
  
  -- Bookmark metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_ticket_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage their own bookmarks
CREATE POLICY "Admins can manage their own bookmarks" 
  ON public.admin_ticket_bookmarks 
  FOR ALL 
  USING ((admin_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))))
  WITH CHECK ((admin_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));

-- Create trigger for updated_at
CREATE TRIGGER update_admin_bookmarks_updated_at
  BEFORE UPDATE ON public.admin_ticket_bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_admin_bookmarks_updated_at();

-- Create index for better performance
CREATE INDEX idx_admin_ticket_bookmarks_admin_id ON public.admin_ticket_bookmarks(admin_id);
CREATE INDEX idx_admin_ticket_bookmarks_original_ticket_id ON public.admin_ticket_bookmarks(original_ticket_id);
