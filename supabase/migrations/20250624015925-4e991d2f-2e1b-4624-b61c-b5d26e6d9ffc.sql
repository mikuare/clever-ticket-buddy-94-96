
-- Create storage bucket for chat attachments (ignore if exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for chat attachments bucket (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated users can upload chat files'
    ) THEN
        CREATE POLICY "Authenticated users can upload chat files" 
          ON storage.objects 
          FOR INSERT 
          TO authenticated 
          WITH CHECK (bucket_id = 'chat-attachments');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated users can view chat files'
    ) THEN
        CREATE POLICY "Authenticated users can view chat files" 
          ON storage.objects 
          FOR SELECT 
          TO authenticated 
          USING (bucket_id = 'chat-attachments');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can delete their own chat files'
    ) THEN
        CREATE POLICY "Users can delete their own chat files" 
          ON storage.objects 
          FOR DELETE 
          TO authenticated 
          USING (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;

-- Update ticket_messages table to support file attachments (only if column doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'ticket_messages' 
        AND column_name = 'attachments'
    ) THEN
        ALTER TABLE public.ticket_messages 
        ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Add policy for users to create messages for their own tickets (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ticket_messages' 
        AND policyname = 'Users can create messages for their tickets'
    ) THEN
        CREATE POLICY "Users can create messages for their tickets" 
          ON public.ticket_messages 
          FOR INSERT 
          WITH CHECK (EXISTS (
            SELECT 1 FROM public.tickets 
            WHERE tickets.id = ticket_messages.ticket_id 
            AND tickets.user_id = auth.uid()
          ));
    END IF;
END $$;
