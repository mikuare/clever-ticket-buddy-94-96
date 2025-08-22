
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare } from 'lucide-react';
import { useTicketChat } from '@/hooks/useTicketChat';
import MessagesList from '@/components/admin/chat/MessagesList';
import MessageInput from '@/components/admin/chat/MessageInput';
import UserTicketDetailsView from '@/components/user/tickets/UserTicketDetailsView';
import type { Ticket } from '@/hooks/useUserTickets';

interface UserTicketChatProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  hasNewMessage?: boolean;
}

const UserTicketChat = ({ ticket, isOpen, onClose, hasNewMessage }: UserTicketChatProps) => {
  const { messages, loading, sendMessage, currentUserId } = useTicketChat(ticket.id, isOpen);

  // Check if chat should be disabled (ticket is resolved and closed)
  const isChatDisabled = ticket.status === 'Resolved' || ticket.status === 'Closed';

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 flex flex-col overflow-hidden md:max-w-6xl max-w-[95vw]">
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
              <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden md:block">
                Chat with support team about this ticket
              </p>
            </div>

            {/* Messages Area - Optimized for mobile */}
            <div className="flex-1 min-h-0 bg-background">
              <ScrollArea className="h-full">
                <div className="p-2 md:p-6">
                  <MessagesList 
                    messages={messages} 
                    currentUserId={currentUserId}
                    ticket={ticket}
                  />
                </div>
              </ScrollArea>
            </div>
            
            {/* Input Area - Compact on mobile */}
            <div className="border-t p-2 md:p-4 flex-shrink-0 bg-background">
              {!isChatDisabled ? (
                <MessageInput 
                  onSendMessage={sendMessage}
                  loading={loading}
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
