
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useMessageSender = (ticketId: string, userId: string, userName: string, isAdmin: boolean) => {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async (message: string, attachments: any[] = []) => {
    if (!message.trim()) return;

    setIsSending(true);
    
    try {
      console.log('Sending message:', { ticketId, userId, userName, isAdmin, message });
      
      // Insert the message
      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketId,
          user_id: userId,
          user_name: userName,
          is_admin: isAdmin,
          message: message.trim(),
          attachments: attachments || []
        });

      if (messageError) {
        console.error('Error sending message:', messageError);
        throw messageError;
      }

      // Log the activity using 'message_sent' instead of 'comment'
      const { error: activityError } = await supabase
        .from('ticket_activities')
        .insert({
          ticket_id: ticketId,
          user_id: userId,
          activity_type: 'message_sent',
          description: `Message sent by ${userName}`,
          admin_name: isAdmin ? userName : null,
          department_code: null
        });

      if (activityError) {
        console.error('Error logging message activity:', activityError);
        // Don't throw here as the message was sent successfully
      }

      console.log('Message sent successfully');
      
    } catch (error: any) {
      console.error('Error in sendMessage:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendMessage,
    isSending
  };
};
