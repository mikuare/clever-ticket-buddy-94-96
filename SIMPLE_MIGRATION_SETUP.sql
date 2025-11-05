-- ================================================
-- SIMPLE ONE-STEP MIGRATION FOR TYPING INDICATOR
-- Copy this ENTIRE file and run it in Supabase SQL Editor
-- ================================================

-- Step 1: Add new columns to ticket_messages (safe to run multiple times)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ticket_messages' AND column_name = 'reply_to'
    ) THEN
        ALTER TABLE public.ticket_messages 
        ADD COLUMN reply_to UUID REFERENCES public.ticket_messages(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ticket_messages' AND column_name = 'edited_at'
    ) THEN
        ALTER TABLE public.ticket_messages 
        ADD COLUMN edited_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ticket_messages' AND column_name = 'is_edited'
    ) THEN
        ALTER TABLE public.ticket_messages 
        ADD COLUMN is_edited BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Step 2: Create index
CREATE INDEX IF NOT EXISTS idx_ticket_messages_reply_to ON public.ticket_messages(reply_to);

-- Step 3: Drop and recreate typing_status table (clean slate)
DROP TABLE IF EXISTS public.typing_status CASCADE;

CREATE TABLE public.typing_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_typing BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ticket_id, user_id)
);

-- Step 4: Enable RLS
ALTER TABLE public.typing_status ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop all existing policies (clean slate)
DROP POLICY IF EXISTS "Users can view typing status for their tickets" ON public.typing_status;
DROP POLICY IF EXISTS "Admins can view all typing status" ON public.typing_status;
DROP POLICY IF EXISTS "Users can manage their typing status for their tickets" ON public.typing_status;
DROP POLICY IF EXISTS "Admins can manage their typing status for any ticket" ON public.typing_status;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.ticket_messages;

-- Step 6: Create policies
CREATE POLICY "Users can view typing status for their tickets" 
  ON public.typing_status 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.tickets 
    WHERE tickets.id = typing_status.ticket_id 
    AND tickets.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all typing status" 
  ON public.typing_status 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  ));

CREATE POLICY "Users can manage their typing status for their tickets" 
  ON public.typing_status 
  FOR ALL 
  USING (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE tickets.id = typing_status.ticket_id 
      AND tickets.user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.tickets 
      WHERE tickets.id = typing_status.ticket_id 
      AND tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage their typing status for any ticket" 
  ON public.typing_status 
  FOR ALL 
  USING (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    user_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can update their own messages" 
  ON public.ticket_messages 
  FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Step 7: Enable real-time
ALTER TABLE public.typing_status REPLICA IDENTITY FULL;

-- Step 8: Add to realtime publication (CRITICAL!)
DO $$
BEGIN
    -- Try to remove if exists, ignore error if doesn't exist
    BEGIN
        EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.typing_status';
    EXCEPTION
        WHEN OTHERS THEN
            NULL; -- Ignore if table is not in publication
    END;
    
    -- Add table to publication
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_status';
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Ignore if already added
END $$;

-- Step 9: Create cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_typing_status()
RETURNS void AS $$
BEGIN
  DELETE FROM public.typing_status
  WHERE updated_at < NOW() - INTERVAL '30 seconds';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create index for cleanup
CREATE INDEX IF NOT EXISTS idx_typing_status_updated_at ON public.typing_status(updated_at);

-- ================================================
-- VERIFICATION QUERIES (Run these after)
-- ================================================

-- Check if typing_status table exists
SELECT 'typing_status table exists: ' || EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'typing_status'
)::text as status;

-- Check if realtime is enabled
SELECT 'Realtime enabled: ' || EXISTS (
  SELECT FROM pg_publication_tables 
  WHERE pubname = 'supabase_realtime' 
  AND tablename = 'typing_status'
)::text as realtime_status;

-- Show policies count
SELECT 'Policies created: ' || COUNT(*)::text
FROM pg_policies 
WHERE tablename = 'typing_status';

-- SUCCESS MESSAGE
SELECT '✅ MIGRATION COMPLETE! Refresh your app and test with 2 users.' as result;

