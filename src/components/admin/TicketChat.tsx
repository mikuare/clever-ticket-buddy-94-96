
import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import TicketChatHeader from './chat/TicketChatHeader';
import MessagesList from './chat/MessagesList';
import MessageInput from './chat/MessageInput';
import { useTicketChat } from '@/hooks/useTicketChat';
import { MessageSquare } from 'lucide-react';
import type { Ticket, TicketMessage } from '@/types/admin';

interface TicketChatProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  onTicketUpdated?: () => void;
  onMessagesViewed?: (ticketId: string) => Promise<void> | void;
}

const TicketChat = ({ ticket, isOpen, onClose, onTicketUpdated, onMessagesViewed }: TicketChatProps) => {
  const { 
    messages, 
    loading, 
    sendMessage, 
    editMessage,
    currentUserId,
    typingUsers,
    updateTypingStatus,
    updateMessage
  } = useTicketChat(ticket.id, isOpen);

  const [replyingTo, setReplyingTo] = useState<TicketMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<TicketMessage | null>(null);
  const lastAcknowledgedMessageId = useRef<string | null>(null);

  // Check if chat should be disabled (ticket is resolved and closed)
  const isChatDisabled = ticket.status === 'Resolved' || ticket.status === 'Closed';

  const handleReply = (message: TicketMessage) => {
    setReplyingTo(message);
    setEditingMessage(null); // Cancel edit if replying
  };

  const handleEdit = (message: TicketMessage) => {
    setEditingMessage(message);
    setReplyingTo(null); // Cancel reply if editing
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    if (editMessage) {
      await editMessage(messageId, newText);
      // Update the message in the UI
      updateMessage(messageId, {
        message: newText,
        is_edited: true,
        edited_at: new Date().toISOString()
      });
    }
  };

  console.log('TicketChat rendering with:', {
    ticketId: ticket.id,
    isOpen,
    messagesCount: messages.length,
    currentUserId,
    loading
  });

  useEffect(() => {
    if (!isOpen) {
      lastAcknowledgedMessageId.current = null;
    }
  }, [isOpen]);

  const latestMessageId = messages.length > 0 ? messages[messages.length - 1].id : '__none__';

  useEffect(() => {
    if (!isOpen || !onMessagesViewed) {
      return;
    }

    if (lastAcknowledgedMessageId.current === latestMessageId) {
      return;
    }

    lastAcknowledgedMessageId.current = latestMessageId;

    Promise.resolve(onMessagesViewed(ticket.id)).catch((error: unknown) => {
      console.error('Failed to clear admin message notifications for ticket', ticket.id, error);
    });
  }, [isOpen, latestMessageId, onMessagesViewed, ticket.id]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50 flex-shrink-0">
          <TicketChatHeader ticket={ticket} />
        </div>
        
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b bg-muted/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Messages & Communication
                </h4>
                {/* Typing Indicator in Header */}
                {typingUsers.filter(u => u.user_id !== currentUserId && u.is_typing).length > 0 ? (
                  <div className="flex items-center gap-2 text-sm text-primary mt-1 animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="flex gap-1">
                      <span className="inline-block w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="inline-block w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="inline-block w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                    <span className="font-medium">
                      {typingUsers.filter(u => u.user_id !== currentUserId && u.is_typing).length === 1
                        ? `${typingUsers.filter(u => u.user_id !== currentUserId && u.is_typing)[0].user_name} is typing`
                        : typingUsers.filter(u => u.user_id !== currentUserId && u.is_typing).length === 2
                        ? `${typingUsers.filter(u => u.user_id !== currentUserId && u.is_typing)[0].user_name} and ${typingUsers.filter(u => u.user_id !== currentUserId && u.is_typing)[1].user_name} are typing`
                        : `${typingUsers.filter(u => u.user_id !== currentUserId && u.is_typing)[0].user_name} and ${typingUsers.filter(u => u.user_id !== currentUserId && u.is_typing).length - 1} others are typing`
                      }
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    Chat with the ticket creator and team members
                  </p>
                )}
              </div>
              {loading && (
                <p className="text-xs text-primary">Loading...</p>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <MessagesList 
              messages={messages} 
              currentUserId={currentUserId}
              ticket={ticket}
              onReply={handleReply}
              onEdit={handleEdit}
              typingUsers={typingUsers}
            />
          </div>

          {/* Input Area - Fixed at bottom with proper spacing */}
          <div className="border-t bg-background p-4 flex-shrink-0 max-h-[40vh] overflow-y-auto">
            {!isChatDisabled ? (
              <MessageInput 
                onSendMessage={sendMessage}
                onEditMessage={handleEditMessage}
                onTypingChange={updateTypingStatus}
                loading={loading}
                replyingTo={replyingTo}
                editingMessage={editingMessage}
                onCancelReply={handleCancelReply}
                onCancelEdit={handleCancelEdit}
              />
            ) : (
              <div className="text-center text-muted-foreground py-3 bg-muted/50 rounded border border-border">
                <p className="font-medium">This ticket has been {ticket.status.toLowerCase()}.</p>
                <p className="text-sm">No new messages can be sent. The conversation is now read-only.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketChat;
