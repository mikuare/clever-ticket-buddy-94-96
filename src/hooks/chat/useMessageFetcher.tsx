
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TicketMessage } from '@/types/admin';

export const useMessageFetcher = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<TicketMessage[]>([]);

  const fetchMessages = useCallback(async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select(`
          id,
          ticket_id,
          user_id,
          user_name,
          is_admin,
          message,
          attachments,
          audio_url,
          audio_duration,
          created_at
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      
      // Validate messages and ensure they have required fields
      const validMessages = (data || []).filter(msg => 
        msg && msg.id && msg.user_name && (msg.message || msg.audio_url)
      );

      setMessages(validMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load chat messages",
        variant: "destructive"
      });
      setMessages([]);
    }
  }, [toast]);

  const addMessage = useCallback((message: TicketMessage) => {
    if (!message?.id || !message?.user_name) return;
    
    setMessages(prev => {
      // Check if message already exists to prevent duplicates
      const exists = prev.some(msg => msg.id === message.id);
      if (exists) return prev;
      
      // Insert message in correct chronological position
      const newMessages = [...prev, message];
      return newMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  }, []);

  const replaceMessage = useCallback((tempId: string, realMessage: TicketMessage) => {
    setMessages(prev => 
      prev.map(msg => msg.id === tempId ? realMessage : msg)
    );
  }, []);

  const removeMessage = useCallback((tempId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== tempId));
  }, []);

  return {
    messages,
    fetchMessages,
    addMessage,
    replaceMessage,
    removeMessage
  };
};
