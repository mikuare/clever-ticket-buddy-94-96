
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TypingStatus } from '@/types/admin';

interface UseTypingIndicatorProps {
  ticketId: string;
  userId?: string;
  userName?: string;
  isAdmin?: boolean;
  isOpen: boolean;
}

export const useTypingIndicator = ({
  ticketId,
  userId,
  userName,
  isAdmin = false,
  isOpen
}: UseTypingIndicatorProps) => {
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);

  // Update typing status
  const updateTypingStatus = useCallback(async (isTyping: boolean) => {
    if (!userId || !userName || !isOpen) {
      console.log('⌨️ Cannot update typing status:', { userId, userName, isOpen });
      return;
    }

    console.log(`⌨️ Updating typing status for ${userName}:`, isTyping);

    try {
      if (isTyping) {
        // Upsert typing status
        const { error } = await supabase
          .from('typing_status')
          .upsert({
            ticket_id: ticketId,
            user_id: userId,
            user_name: userName,
            is_admin: isAdmin,
            is_typing: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'ticket_id,user_id'
          });
        
        if (error) {
          console.error('⌨️ Error upserting typing status:', error);
        } else {
          console.log('✅ Typing status upserted successfully');
        }
      } else {
        // Remove typing status
        const { error } = await supabase
          .from('typing_status')
          .delete()
          .eq('ticket_id', ticketId)
          .eq('user_id', userId);
          
        if (error) {
          console.error('⌨️ Error deleting typing status:', error);
        } else {
          console.log('✅ Typing status deleted successfully');
        }
      }
    } catch (error) {
      // Silently fail if table doesn't exist yet (backward compatibility)
      console.log('⌨️ Typing status table not available yet:', error);
    }
  }, [ticketId, userId, userName, isAdmin, isOpen]);

  // Subscribe to typing status changes
  useEffect(() => {
    if (!isOpen || !ticketId) return;

    // Fetch initial typing status
    const fetchTypingStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('typing_status')
          .select('*')
          .eq('ticket_id', ticketId)
          .eq('is_typing', true);

        if (!error && data) {
          setTypingUsers(data);
        }
      } catch (error) {
        // Table might not exist yet
        console.log('Typing status table not available yet');
      }
    };

    fetchTypingStatus();

    // Subscribe to real-time changes
    let channel: any = null;
    try {
      channel = supabase
        .channel(`typing_status:${ticketId}`, {
          config: {
            broadcast: { self: false }, // Don't receive own typing status
            presence: { key: userId }
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'typing_status',
            filter: `ticket_id=eq.${ticketId}`
          },
          (payload) => {
            console.log('⌨️ Typing status change:', payload);

            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const newStatus = payload.new as TypingStatus;
              console.log('New typing status:', newStatus);
              
              if (newStatus.is_typing && newStatus.user_id !== userId) {
                setTypingUsers(prev => {
                  const filtered = prev.filter(u => u.user_id !== newStatus.user_id);
                  return [...filtered, newStatus];
                });
              } else {
                setTypingUsers(prev => prev.filter(u => u.user_id !== newStatus.user_id));
              }
            } else if (payload.eventType === 'DELETE') {
              const oldStatus = payload.old as TypingStatus;
              console.log('Typing status deleted:', oldStatus);
              setTypingUsers(prev => prev.filter(u => u.user_id !== oldStatus.user_id));
            }
          }
        )
        .subscribe((status) => {
          console.log('⌨️ Typing indicator subscription status:', status);
        });
    } catch (error) {
      console.log('Could not subscribe to typing status (table may not exist yet):', error);
    }

    // Cleanup typing status on unmount
    return () => {
      if (userId) {
        supabase
          .from('typing_status')
          .delete()
          .eq('ticket_id', ticketId)
          .eq('user_id', userId)
          .then(() => console.log('Cleaned up typing status'))
          .catch(() => console.log('Could not cleanup typing status (table may not exist yet)'));
      }
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [isOpen, ticketId, userId]);

  // Auto cleanup old typing statuses
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
      setTypingUsers(prev => 
        prev.filter(user => new Date(user.updated_at) > new Date(thirtySecondsAgo))
      );
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [isOpen]);

  return {
    typingUsers,
    updateTypingStatus
  };
};

