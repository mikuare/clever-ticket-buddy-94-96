
import { Dialog, DialogContent } from '@/components/ui/dialog';
import TicketChatHeader from './chat/TicketChatHeader';
import MessagesList from './chat/MessagesList';
import MessageInput from './chat/MessageInput';
import { useTicketChat } from '@/hooks/useTicketChat';
import { MessageSquare } from 'lucide-react';
import type { Ticket } from '@/types/admin';

interface TicketChatProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  onTicketUpdated?: () => void;
}

const TicketChat = ({ ticket, isOpen, onClose, onTicketUpdated }: TicketChatProps) => {
  const { messages, loading, sendMessage, currentUserId } = useTicketChat(ticket.id, isOpen);

  // Check if chat should be disabled (ticket is resolved and closed)
  const isChatDisabled = ticket.status === 'Resolved' || ticket.status === 'Closed';

  console.log('TicketChat rendering with:', {
    ticketId: ticket.id,
    isOpen,
    messagesCount: messages.length,
    currentUserId,
    loading
  });

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
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages & Communication
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              Chat with the ticket creator and team members
            </p>
            {loading && (
              <p className="text-xs text-primary mt-1">Loading messages...</p>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <MessagesList 
              messages={messages} 
              currentUserId={currentUserId}
              ticket={ticket}
            />
          </div>

          {/* Input Area */}
          <div className="border-t bg-background p-4 flex-shrink-0">
            {!isChatDisabled ? (
              <MessageInput 
                onSendMessage={sendMessage}
                loading={loading}
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
