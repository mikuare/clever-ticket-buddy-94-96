
-- Create departments table with your specific departments
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert your specific departments
INSERT INTO public.departments (code, name) VALUES
('ACC', 'Accounting Department'),
('ADC', 'Adamant Development Corp.'),
('CDC', 'Cafe De Casilda Staff'),
('CON', 'Construction'),
('EMD', 'Equipment and Machineries Dept.'),
('FIN', 'Finance Department'),
('HRD', 'Human Resource Management'),
('MRD', 'Material Waste & Segregation DEPT.'),
('OJT', 'On the Job Trainee'),
('PDN', 'Production Department'),
('POD', 'Project Operations Dept'),
('QDC', 'QG Development Corp Staff'),
('QHI', 'QMAZ Holding Staff'),
('QHS', 'Quality Health Safety & Environment'),
('QMAZCONS', 'QMAZ Consultant'),
('QMF', 'QM FARM STAFF'),
('QMH', 'QM HARDWARE STAFF'),
('QMR', 'QM DIVING RESORT STAFF'),
('SCD', 'SUPPLY CHAIN DEPARTMENT'),
('SNM', 'SALES & MARKETING DEPT.'),
('ADM', 'DIGITAL SYSTEM AUTHORIZATION ADMINISTRATIONS');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  department_code TEXT NOT NULL REFERENCES public.departments(code),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  department_code TEXT NOT NULL REFERENCES public.departments(code),
  assigned_admin_id UUID REFERENCES auth.users(id),
  assigned_admin_name TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for tickets
CREATE POLICY "Users can view their own tickets" 
  ON public.tickets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets" 
  ON public.tickets 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  ));

CREATE POLICY "Users can create tickets" 
  ON public.tickets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" 
  ON public.tickets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all tickets" 
  ON public.tickets 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  ));

-- Create ticket activities table for audit trail
CREATE TABLE public.ticket_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('created', 'assigned', 'updated', 'resolved', 'comment')),
  description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ticket activities
ALTER TABLE public.ticket_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for ticket activities
CREATE POLICY "Users can view activities for their tickets" 
  ON public.ticket_activities 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.tickets 
    WHERE tickets.id = ticket_activities.ticket_id 
    AND tickets.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all activities" 
  ON public.ticket_activities 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  ));

CREATE POLICY "Users can create activities" 
  ON public.ticket_activities 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create user cooldowns table
CREATE TABLE public.user_cooldowns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_ticket_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user cooldowns
ALTER TABLE public.user_cooldowns ENABLE ROW LEVEL SECURITY;

-- Create policies for user cooldowns
CREATE POLICY "Users can view their own cooldown" 
  ON public.user_cooldowns 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own cooldown" 
  ON public.user_cooldowns 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create function to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  counter INTEGER;
  ticket_num TEXT;
BEGIN
  -- Get the current count of tickets today
  SELECT COUNT(*) + 1 INTO counter
  FROM public.tickets
  WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Format: TKT-YYYYMMDD-XXX
  ticket_num := 'TKT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 3, '0');
  
  RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_number
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, department_code, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'department_code', 'ACC'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'department_code' = 'ADM' THEN true
      ELSE false
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
