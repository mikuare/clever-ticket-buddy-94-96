
-- Add RLS policies for profiles table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can view their own profile'
    ) THEN
        CREATE POLICY "Users can view their own profile" 
          ON public.profiles 
          FOR SELECT 
          USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Admins can view all profiles'
    ) THEN
        CREATE POLICY "Admins can view all profiles" 
          ON public.profiles 
          FOR SELECT 
          USING (EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() 
            AND p.is_admin = true
          ));
    END IF;
END $$;

-- Add RLS policies for tickets table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tickets' 
        AND policyname = 'Users can view their own tickets'
    ) THEN
        CREATE POLICY "Users can view their own tickets" 
          ON public.tickets 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tickets' 
        AND policyname = 'Admins can view all tickets'
    ) THEN
        CREATE POLICY "Admins can view all tickets" 
          ON public.tickets 
          FOR SELECT 
          USING (EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
          ));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tickets' 
        AND policyname = 'Users can create tickets'
    ) THEN
        CREATE POLICY "Users can create tickets" 
          ON public.tickets 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tickets' 
        AND policyname = 'Users can update their own tickets'
    ) THEN
        CREATE POLICY "Users can update their own tickets" 
          ON public.tickets 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tickets' 
        AND policyname = 'Admins can update all tickets'
    ) THEN
        CREATE POLICY "Admins can update all tickets" 
          ON public.tickets 
          FOR UPDATE 
          USING (EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
          ));
    END IF;
END $$;

-- Add RLS policies for ticket_activities table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ticket_activities' 
        AND policyname = 'Users can view activities for their tickets'
    ) THEN
        CREATE POLICY "Users can view activities for their tickets" 
          ON public.ticket_activities 
          FOR SELECT 
          USING (EXISTS (
            SELECT 1 FROM public.tickets 
            WHERE tickets.id = ticket_activities.ticket_id 
            AND tickets.user_id = auth.uid()
          ));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ticket_activities' 
        AND policyname = 'Admins can view all activities'
    ) THEN
        CREATE POLICY "Admins can view all activities" 
          ON public.ticket_activities 
          FOR SELECT 
          USING (EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
          ));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ticket_activities' 
        AND policyname = 'Users can create activities'
    ) THEN
        CREATE POLICY "Users can create activities" 
          ON public.ticket_activities 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Add RLS policies for user_cooldowns table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_cooldowns' 
        AND policyname = 'Users can view their own cooldown'
    ) THEN
        CREATE POLICY "Users can view their own cooldown" 
          ON public.user_cooldowns 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_cooldowns' 
        AND policyname = 'Users can update their own cooldown'
    ) THEN
        CREATE POLICY "Users can update their own cooldown" 
          ON public.user_cooldowns 
          FOR ALL 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Enable realtime for tickets table
ALTER TABLE public.tickets REPLICA IDENTITY FULL;

-- Add tickets table to realtime publication (ignore if already exists)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
    EXCEPTION
        WHEN duplicate_object THEN
            -- Table already in publication, ignore
            NULL;
    END;
END $$;
