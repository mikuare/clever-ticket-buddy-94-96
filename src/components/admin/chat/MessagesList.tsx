
import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import TicketDetailsCard from './TicketDetailsCard';
import TypingIndicator from './TypingIndicator';
import type { TicketMessage, Ticket, TypingStatus } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';

interface MessagesListProps {
  messages: TicketMessage[];
  currentUserId?: string;
  ticket: Ticket;
  onReply?: (message: TicketMessage) => void;
  onEdit?: (message: TicketMessage) => void;
  typingUsers?: TypingStatus[];
}

const MessagesList = ({ 
  messages, 
  currentUserId, 
  ticket,
  onReply,
  onEdit,
  typingUsers = []
}: MessagesListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [avatarMap, setAvatarMap] = useState<Record<string, string | null>>({});

  // Auto-scroll when messages change OR when typing indicator appears
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  useEffect(() => {
    const loadAvatars = async () => {
      const uniqueIds = Array.from(new Set(messages.map(m => m.user_id))).filter(id => !(id in avatarMap));
      if (uniqueIds.length === 0) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar_url')
        .in('id', uniqueIds);
      if (!error && data) {
        setAvatarMap(prev => {
          const next = { ...prev } as Record<string, string | null>;
          (data as any[]).forEach((p) => { next[p.id] = p.avatar_url || null; });
          uniqueIds.forEach((id: string) => { if (!(id in next)) next[id] = null; });
          return next;
        });
      } else {
        setAvatarMap(prev => {
          const next = { ...prev } as Record<string, string | null>;
          uniqueIds.forEach((id: string) => { if (!(id in next)) next[id] = null; });
          return next;
        });
      }
    };
    loadAvatars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Removed excessive console logging to prevent rapid re-renders

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto bg-muted/30">
        {/* Ticket Details Card - Compact on mobile */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm p-2 md:p-4 border-b border-border">
          <TicketDetailsCard ticket={ticket} />
        </div>

        {/* Messages - Reduced padding on mobile */}
        <div className="p-2 md:p-4 space-y-2 md:space-y-4 bg-card/20">
          {!messages || messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-4 md:py-8 px-2 md:px-4">
              <div className="bg-accent/50 border border-accent rounded-lg p-3 md:p-6 max-w-2xl mx-auto">
                <h3 className="text-sm md:text-lg font-semibold text-accent-foreground mb-2 md:mb-3">👋 Thank you for contacting Helpdesk!</h3>
                <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-accent-foreground/90">
                  <p>📨 Your support ticket has been successfully created. A member of our support team will review your request shortly and get back to you as soon as possible.</p>
                  <p>💬 You can now communicate directly with our support team through this ticket.</p>
                  <p>⏳ We appreciate your patience and are here to help!</p>
                  <p className="font-medium mt-2 md:mt-4">— Helpdesk Chatbot 🤖</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-xs text-muted-foreground mb-1 md:mb-2">
                Displaying {messages.length} message(s)
              </div>
              {messages.map((message) => (
                <div key={`message-${message.id}-${message.created_at}`} className="mb-2 md:mb-4">
                  <MessageBubble
                    message={message}
                    isCurrentUser={message.user_id === currentUserId}
                    avatarUrl={avatarMap[message.user_id] || undefined}
                    onReply={onReply}
                    onEdit={onEdit}
                    canEdit={message.user_id === currentUserId && !message.audio_url}
                    canReply={true}
                  />
                </div>
              ))}
            </>
          )}
          
          {/* Scroll anchor - always at the bottom */}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default MessagesList;
