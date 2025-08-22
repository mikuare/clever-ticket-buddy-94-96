
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MessageSquare, Clock as ClockIcon, CheckCircle, RotateCcw } from 'lucide-react';
import TicketProgressionModal from '@/components/TicketProgressionModal';
import UserTicketResolutionNotes from './UserTicketResolutionNotes';
import type { Ticket } from '@/hooks/useUserTickets';

interface UserTicketCardProps {
  ticket: Ticket;
  hasNewMessages: boolean;
  canClose: boolean;
  canReopen: boolean;
  timeRemaining: number;
  isClosing: boolean;
  isReopening: boolean;
  onViewTicket: (ticket: Ticket) => void;
  onCloseTicket: (ticketId: string, ticketNumber: string) => void;
  onReopenTicket: (ticketId: string, ticketNumber: string) => void;
  getStatusColor: (status: string) => string;
  getTicketMetadata: (ticket: Ticket) => {
    classification: string;
    categoryType: string;
    acumaticaModule: string;
  };
  formatTimeRemaining: (seconds: number) => string;
}

const UserTicketCard = ({
  ticket,
  hasNewMessages,
  canClose,
  canReopen,
  timeRemaining,
  isClosing,
  isReopening,
  onViewTicket,
  onCloseTicket,
  onReopenTicket,
  getStatusColor,
  getTicketMetadata,
  formatTimeRemaining
}: UserTicketCardProps) => {
  const [showProgression, setShowProgression] = useState(false);
  const metadata = getTicketMetadata(ticket);

  // Updated status color function to match new color scheme
  const getUpdatedStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-blue-100 text-blue-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground">{ticket.title}</h3>
              {hasNewMessages && (
                <Badge variant="secondary" className="bg-red-100 text-red-800 flex items-center gap-1 text-xs">
                  <MessageSquare className="h-3 w-3" />
                  New Message
                </Badge>
              )}
              <Badge className={getUpdatedStatusColor(ticket.status)}>
                {ticket.status}
              </Badge>
            </div>
            
            {/* Welcome message for newly created tickets */}
            {ticket.status === 'Open' && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                <p className="text-sm text-blue-800">
                  🎉 <strong>Ticket successfully created!</strong> Your request has been received and our support team will review it shortly. You can track progress and communicate with our team by clicking "View Details".
                </p>
              </div>
            )}
            
            <div 
              className="text-muted-foreground mb-2 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: ticket.description }}
            />
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowProgression(true)}
              className="flex items-center gap-1"
            >
              <ClockIcon className="w-4 h-4" />
              Ticket Progression
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewTicket(ticket)}
              className={`flex items-center gap-1 ${hasNewMessages ? 'border-red-300 text-red-700 hover:bg-red-50' : ''}`}
            >
              <Eye className="w-4 h-4" />
              View Details
            </Button>
            
            {canClose && (
              <Button
                size="sm"
                onClick={() => onCloseTicket(ticket.id, ticket.ticket_number)}
                disabled={isClosing}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4" />
                {isClosing ? 'Closing...' : 'Close Ticket'}
              </Button>
            )}
            
            {canReopen && (
              <Button
                size="sm"
                onClick={() => onReopenTicket(ticket.id, ticket.ticket_number)}
                disabled={isReopening}
                className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <RotateCcw className="w-4 h-4" />
                {isReopening ? 'Reopening...' : 'Reopen Ticket'}
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-end">
          {/* Left side - Ticket metadata */}
          <div className="text-sm text-muted-foreground space-y-1 flex-1">
            <div className="flex flex-wrap gap-4">
              <span>ID: {ticket.ticket_number}</span>
              <span>Classification: {metadata.classification}</span>
              <span>Category: {metadata.categoryType}</span>
              <span>Module: {metadata.acumaticaModule}</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
              {ticket.assigned_admin_name && (
                <span>Assigned to: {ticket.assigned_admin_name}</span>
              )}
              {canClose && timeRemaining > 0 && (
                <span className="text-orange-600 font-medium">
                  Auto-close in: {formatTimeRemaining(timeRemaining)}
                </span>
              )}
            </div>
          </div>
          
          {/* Right side - Resolution notes */}
          <div className="flex-shrink-0 ml-4 max-w-md">
            <UserTicketResolutionNotes resolutionNotes={ticket.resolution_notes} />
          </div>
        </div>
      </div>

      <TicketProgressionModal
        ticket={ticket}
        isOpen={showProgression}
        onClose={() => setShowProgression(false)}
      />
    </>
  );
};

export default UserTicketCard;
