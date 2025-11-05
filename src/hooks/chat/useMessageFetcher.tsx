
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TicketMessage } from '@/types/admin';

export const useMessageFetcher = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<TicketMessage[]>([]);

  const fetchMessages = useCallback(async (ticketId: string) => {
    try {
      // Try fetching with new fields first
      let { data, error } = await supabase
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
          created_at,
          reply_to,
          edited_at,
          is_edited
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      // If error is about unknown columns, try without new fields
      if (error && (error.message?.includes('column') || error.message?.includes('does not exist'))) {
        console.log('New columns not found, fetching with basic fields only');
        const result = await supabase
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
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      
      // Validate messages and ensure they have required fields
      const validMessages = (data || []).filter(msg => 
        msg && msg.id && msg.user_name && (msg.message || msg.audio_url)
      );

      // Fetch replied messages for those that have reply_to (if field exists)
      const messagesWithReplies = await Promise.all(
        validMessages.map(async (msg) => {
          if (msg.reply_to) {
            try {
              const { data: repliedMsg } = await supabase
                .from('ticket_messages')
                .select('id, user_name, message, audio_url')
                .eq('id', msg.reply_to)
                .single();
              
              return {
                ...msg,
                replied_message: repliedMsg || null
              };
            } catch (e) {
              // reply_to field might not exist yet
              return msg;
            }
          }
          return msg;
        })
      );

      setMessages(messagesWithReplies);
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

  const replaceMessage = useCallback(async (tempId: string, realMessage: TicketMessage) => {
    // If real message has reply_to, fetch the replied message data
    if (realMessage.reply_to && !realMessage.replied_message) {
      try {
        const { data: repliedMsg } = await supabase
          .from('ticket_messages')
          .select('id, user_name, message, audio_url')
          .eq('id', realMessage.reply_to)
          .single();
        
        realMessage.replied_message = repliedMsg || null;
      } catch (error) {
        console.log('Could not fetch replied message for replacement:', error);
      }
    }
    
    setMessages(prev => 
      prev.map(msg => msg.id === tempId ? realMessage : msg)
    );
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<TicketMessage>) => {
    setMessages(prev =>
      prev.map(msg => msg.id === messageId ? { ...msg, ...updates } : msg)
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
    removeMessage,
    updateMessage
  };
};
