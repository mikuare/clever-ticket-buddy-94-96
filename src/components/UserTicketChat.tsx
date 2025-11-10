
import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare } from 'lucide-react';
import { useTicketChat } from '@/hooks/useTicketChat';
import MessagesList from '@/components/admin/chat/MessagesList';
import MessageInput from '@/components/admin/chat/MessageInput';
import UserTicketDetailsView from '@/components/user/tickets/UserTicketDetailsView';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Ticket } from '@/hooks/useUserTickets';
import type { TicketMessage } from '@/types/admin';

interface UserTicketChatProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  hasNewMessage?: boolean;
  onMessagesViewed?: (ticketId: string) => Promise<void> | void;
}

const UserTicketChat = ({ ticket, isOpen, onClose, hasNewMessage, onMessagesViewed }: UserTicketChatProps) => {
  const isMobile = useIsMobile();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-blue-100 text-blue-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTicketMetadata = (ticket: Ticket) => {
    const attachments = ticket.attachments;
    let classification = 'General';
    let categoryType = 'Default';
    let acumaticaModule = 'General';

    if (attachments && typeof attachments === 'object' && !Array.isArray(attachments)) {
      const attachmentObj = attachments as Record<string, any>;
      classification = attachmentObj.classification || 'General';
      categoryType = attachmentObj.categoryType || 'Default';
      acumaticaModule = attachmentObj.acumaticaModule || 'General';
    }

    return {
      classification,
      categoryType,
      acumaticaModule
    };
  };

  // Reset acknowledgement when modal closes to ensure future openings re-sync
  useEffect(() => {
    if (!isOpen) {
      lastAcknowledgedMessageId.current = null;
    }
  }, [isOpen]);

  // Mark messages as viewed when modal opens or new messages arrive
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
      console.error('Failed to mark messages as viewed for ticket', ticket.id, error);
    });
  }, [isOpen, latestMessageId, onMessagesViewed, ticket.id]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-w-[95vw] md:max-w-6xl h-[90vh] md:h-[85vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-4 md:p-6 pb-2 md:pb-0 flex-shrink-0 border-b">
          <DialogTitle className="flex items-center gap-2 text-sm md:text-base">
            <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
            <span className="truncate">Ticket {ticket.ticket_number}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Mobile: Ticket Details - Collapsible/Hidden by default */}
          <div className="md:w-1/3 md:border-r flex-shrink-0 overflow-hidden hidden md:block">
            <ScrollArea className="h-full p-4 md:p-6">
              <UserTicketDetailsView 
                ticket={ticket}
                getStatusColor={getStatusColor}
                getTicketMetadata={getTicketMetadata}
              />
            </ScrollArea>
          </div>
          
          {/* Chat - Full width on mobile */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Chat Header - Compact on mobile */}
            <div className="p-2 md:p-4 border-b bg-muted/50 flex-shrink-0">
              <h4 className="font-medium text-foreground flex items-center gap-2 text-sm md:text-base">
                <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden md:inline">Messages & Communication</span>
                <span className="md:hidden">Chat</span>
              </h4>
              {/* Typing Indicator in Header */}
              {typingUsers.filter(u => u.user_id !== currentUserId && u.is_typing).length > 0 ? (
                <div className="flex items-center gap-2 text-xs md:text-sm text-primary mt-1 animate-in fade-in slide-in-from-left-2 duration-300">
                  <span className="flex gap-1">
                    <span className="inline-block w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="inline-block w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="inline-block w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                  <span className="font-medium">
                    {typingUsers.filter(u => u.user_id !== currentUserId && u.is_typing).length === 1
                      ? `${typingUsers.filter(u => u.user_id !== currentUserId && u.is_typing)[0].user_name} is typing`
                      : typingUsers.filter(u => u.user_id !== currentUserId && u.is_typing).length === 2
                      ? `${typingUsers.filter(u => u.user_id !== currentUserId && u.is_typing)[0].user_name} and ${typingUsers.filter(u => u.user_id !== currentUserId && u.is_typing)[1].user_name} are typing`
                      : `Support team is typing`
                    }
                  </span>
                </div>
              ) : (
                <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden md:block">
                  Chat with support team about this ticket
                </p>
              )}
            </div>

            {/* Messages Area - Optimized for mobile */}
            <div className="flex-1 min-h-0 bg-background">
              <ScrollArea className="h-full">
                <div className="p-2 md:p-6 space-y-4">
                  {isMobile && (
                    <div className="md:hidden rounded-lg border border-border bg-card p-3 shadow-sm">
                      <UserTicketDetailsView
                        ticket={ticket}
                        getStatusColor={getStatusColor}
                        getTicketMetadata={getTicketMetadata}
                      />
                    </div>
                  )}
                  <MessagesList 
                    messages={messages} 
                    currentUserId={currentUserId}
                    ticket={ticket}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    typingUsers={typingUsers}
                  />
                </div>
              </ScrollArea>
            </div>
            
            {/* Input Area - Compact on mobile with proper scrolling */}
            <div className="border-t p-2 md:p-4 flex-shrink-0 bg-background">
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
                <div className="text-center text-muted-foreground py-2 md:py-3 bg-muted/50 rounded border border-border">
                  <p className="font-medium text-xs md:text-sm">This ticket has been {ticket.status.toLowerCase()}.</p>
                  <p className="text-xs md:text-sm">No new messages can be sent. The conversation is now read-only.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserTicketChat;
