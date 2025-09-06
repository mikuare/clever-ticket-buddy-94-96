
-- Fix the ticket number generation to handle concurrent requests
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  counter INTEGER;
  ticket_num TEXT;
  max_attempts INTEGER := 10;
  attempt INTEGER := 0;
BEGIN
  LOOP
    -- Get the current count of tickets today with a slight random offset to reduce conflicts
    SELECT COUNT(*) + 1 + (RANDOM() * 100)::INTEGER INTO counter
    FROM public.tickets
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Format: TKT-YYYYMMDD-XXX
    ticket_num := 'TKT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 3, '0');
    
    -- Check if this ticket number already exists
    IF NOT EXISTS (SELECT 1 FROM public.tickets WHERE ticket_number = ticket_num) THEN
      RETURN ticket_num;
    END IF;
    
    -- Increment attempt counter and exit if max attempts reached
    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      -- Fallback: use timestamp-based unique identifier
      ticket_num := 'TKT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
      RETURN ticket_num;
    END IF;
    
    -- Small delay to reduce contention
    PERFORM pg_sleep(0.01);
  END LOOP;
END;
$$;

-- Also ensure all departments can create tickets by adding missing RLS policies
DROP POLICY IF EXISTS "Users can create tickets" ON public.tickets;

CREATE POLICY "Users can create tickets" 
  ON public.tickets 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND department_code IS NOT NULL
      AND department_code != ''
    )
  );

-- Ensure ticket activities can be created by all users
DROP POLICY IF EXISTS "Users can create activities" ON public.ticket_activities;

CREATE POLICY "Users can create activities" 
  ON public.ticket_activities 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Make sure user cooldowns work for all departments
DROP POLICY IF EXISTS "Users can update their own cooldown" ON public.user_cooldowns;

CREATE POLICY "Users can manage their own cooldown" 
  ON public.user_cooldowns 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
