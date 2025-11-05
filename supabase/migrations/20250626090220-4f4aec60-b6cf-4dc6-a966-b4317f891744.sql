
-- Create table for managing classifications
CREATE TABLE public.ticket_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create table for managing categories with their classification mappings
CREATE TABLE public.ticket_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classification_id uuid REFERENCES public.ticket_classifications(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(classification_id, name)
);

-- Create table for managing Acumatica modules
CREATE TABLE public.acumatica_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on all new tables
ALTER TABLE public.ticket_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acumatica_modules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ticket_classifications
CREATE POLICY "Everyone can view active classifications" 
  ON public.ticket_classifications 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage classifications" 
  ON public.ticket_classifications 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create RLS policies for ticket_categories
CREATE POLICY "Everyone can view active categories" 
  ON public.ticket_categories 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage categories" 
  ON public.ticket_categories 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create RLS policies for acumatica_modules
CREATE POLICY "Everyone can view active modules" 
  ON public.acumatica_modules 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage modules" 
  ON public.acumatica_modules 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Insert initial data from the existing constants
INSERT INTO public.ticket_classifications (name, created_by) VALUES
  ('Customization', NULL),
  ('Login Access', NULL),
  ('General Inquiry', NULL),
  ('System Suggestion', NULL),
  ('Network & Connectivity', NULL),
  ('Master Data Management', NULL),
  ('System Issues', NULL),
  ('Reports', NULL);

-- Insert initial categories - doing this step by step to avoid the unnest issue
-- First, get the classification IDs
DO $$
DECLARE
    customization_id uuid;
    login_access_id uuid;
    general_inquiry_id uuid;
    system_suggestion_id uuid;
    network_connectivity_id uuid;
    master_data_id uuid;
    system_issues_id uuid;
    reports_id uuid;
BEGIN
    -- Get classification IDs
    SELECT id INTO customization_id FROM public.ticket_classifications WHERE name = 'Customization';
    SELECT id INTO login_access_id FROM public.ticket_classifications WHERE name = 'Login Access';
    SELECT id INTO general_inquiry_id FROM public.ticket_classifications WHERE name = 'General Inquiry';
    SELECT id INTO system_suggestion_id FROM public.ticket_classifications WHERE name = 'System Suggestion';
    SELECT id INTO network_connectivity_id FROM public.ticket_classifications WHERE name = 'Network & Connectivity';
    SELECT id INTO master_data_id FROM public.ticket_classifications WHERE name = 'Master Data Management';
    SELECT id INTO system_issues_id FROM public.ticket_classifications WHERE name = 'System Issues';
    SELECT id INTO reports_id FROM public.ticket_classifications WHERE name = 'Reports';

    -- Insert categories for Customization
    INSERT INTO public.ticket_categories (classification_id, name, created_by) VALUES
        (customization_id, 'High', NULL),
        (customization_id, 'Medium', NULL),
        (customization_id, 'Low', NULL);

    -- Insert categories for Login Access
    INSERT INTO public.ticket_categories (classification_id, name, created_by) VALUES
        (login_access_id, 'Invalid Credentials', NULL),
        (login_access_id, 'User Locked', NULL),
        (login_access_id, 'Role or Access', NULL),
        (login_access_id, 'Request Access for New Module', NULL);

    -- Insert categories for General Inquiry
    INSERT INTO public.ticket_categories (classification_id, name, created_by) VALUES
        (general_inquiry_id, 'Default', NULL);

    -- Insert categories for System Suggestion
    INSERT INTO public.ticket_categories (classification_id, name, created_by) VALUES
        (system_suggestion_id, 'Continuous Improvements', NULL);

    -- Insert categories for Network & Connectivity
    INSERT INTO public.ticket_categories (classification_id, name, created_by) VALUES
        (network_connectivity_id, 'No Internet Connectivity', NULL);

    -- Insert categories for Master Data Management
    INSERT INTO public.ticket_categories (classification_id, name, created_by) VALUES
        (master_data_id, 'Add Items', NULL),
        (master_data_id, 'Corrections', NULL);

    -- Insert categories for System Issues
    INSERT INTO public.ticket_categories (classification_id, name, created_by) VALUES
        (system_issues_id, 'Transaction Timeout', NULL);

    -- Insert categories for Reports
    INSERT INTO public.ticket_categories (classification_id, name, created_by) VALUES
        (reports_id, 'Default', NULL);
END $$;

-- Insert initial Acumatica modules
INSERT INTO public.acumatica_modules (name, created_by) VALUES
  ('Projects', NULL),
  ('Project Management', NULL),
  ('Purchases', NULL),
  ('Payables', NULL),
  ('Inventory', NULL),
  ('Receivables', NULL),
  ('Banking', NULL),
  ('Finance', NULL),
  ('Sales Orders', NULL),
  ('Taxes', NULL),
  ('Approval List', NULL),
  ('Data Views', NULL),
  ('Cash Fund Management', NULL),
  ('Philippine Taxation', NULL),
  ('Compliance', NULL),
  ('Fixed Assets', NULL),
  ('Currency Management', NULL),
  ('Configuration', NULL),
  ('Integration', NULL),
  ('User Security', NULL),
  ('Row Level Security', NULL),
  ('Customization', NULL),
  ('System Management', NULL);

-- Enable realtime for the new tables
ALTER TABLE public.ticket_classifications REPLICA IDENTITY FULL;
ALTER TABLE public.ticket_categories REPLICA IDENTITY FULL;
ALTER TABLE public.acumatica_modules REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_classifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.acumatica_modules;
