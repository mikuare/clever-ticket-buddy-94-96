
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TicketMessage } from '@/types/admin';

interface UseMessageSenderProps {
  ticketId: string;
  profile: any;
  onOptimisticUpdate: (message: TicketMessage) => void;
  onMessageSent: (tempId: string, realMessage: TicketMessage) => void;
  onMessageError: (tempId: string) => void;
}

export const useMessageSender = ({
  ticketId,
  profile,
  onOptimisticUpdate,
  onMessageSent,
  onMessageError
}: UseMessageSenderProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (messageText: string, attachments?: any[], audioBlob?: Blob) => {
    if (!profile) return;

    const tempId = Date.now().toString();
    
    let audioUrl = null;
    let audioDuration = 0;
    
    // Upload audio if provided
    if (audioBlob) {
      try {
        const fileName = `audio-${tempId}.webm`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('ticket-attachments')
          .upload(fileName, audioBlob, {
            contentType: audioBlob.type,
          });

        if (uploadError) {
          console.error('Audio upload error:', uploadError);
          toast({
            title: "Audio Upload Failed",
            description: "Failed to upload audio message. Please try again.",
            variant: "destructive"
          });
          return;
        }

        const { data: urlData } = supabase.storage
          .from('ticket-attachments')
          .getPublicUrl(uploadData.path);
        
        audioUrl = urlData.publicUrl;
        
        // Get audio duration (approximate based on blob size)
        audioDuration = Math.round(audioBlob.size / 16000); // Rough estimate
        
      } catch (error) {
        console.error('Error uploading audio:', error);
        toast({
          title: "Audio Upload Failed",
          description: "Failed to upload audio message. Please try again.",
          variant: "destructive"
        });
        return;
      }
    }

    const tempMessage: TicketMessage = {
      id: tempId,
      ticket_id: ticketId,
      user_id: profile.id,
      user_name: profile.full_name,
      is_admin: profile.is_admin,
      message: messageText,
      attachments: attachments || [],
      audio_url: audioUrl,
      audio_duration: audioDuration,
      created_at: new Date().toISOString()
    };

    // Add message to UI immediately (optimistic update) - this makes it instant
    onOptimisticUpdate(tempMessage);

    // Send message in background without blocking UI
    try {
      const newMessage = {
        ticket_id: ticketId,
        user_id: profile.id,
        user_name: profile.full_name,
        is_admin: profile.is_admin,
        message: messageText,
        attachments: attachments || [],
        audio_url: audioUrl,
        audio_duration: audioDuration
      };

      // Just insert the message - no need to check status frequently
      const messageResult = await supabase
        .from('ticket_messages')
        .insert(newMessage)
        .select()
        .single();

      if (messageResult.error) {
        console.error('Error inserting message:', messageResult.error);
        onMessageError(tempId);
        toast({
          title: "Message Not Sent",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('Message sent successfully:', messageResult.data);
      onMessageSent(tempId, messageResult.data);
      
      // Log activity in background without awaiting
      Promise.resolve(
        supabase
          .from('ticket_activities')
          .insert({
            ticket_id: ticketId,
            user_id: profile.id,
            activity_type: 'comment',
            description: `${profile.is_admin ? 'Admin' : 'User'} added a comment${attachments && attachments.length > 0 ? ` with ${attachments.length} attachment(s)` : ''}`
          })
      ).catch(error => console.error('Activity logging failed (non-critical):', error));

    } catch (error) {
      console.error('Error sending message:', error);
      onMessageError(tempId);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  }, [ticketId, profile, onOptimisticUpdate, onMessageSent, onMessageError, toast]);

  return { sendMessage, loading };
};
