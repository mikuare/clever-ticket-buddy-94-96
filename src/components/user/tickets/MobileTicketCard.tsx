import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, Eye, RotateCcw, CheckCircle, Edit3, GitBranch } from 'lucide-react';
import type { Ticket } from '@/hooks/useUserTickets';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import TicketProgressionModal from '@/components/TicketProgressionModal';
import { useTicketDetailsChanged } from '@/hooks/useTicketDetailsChanged';

interface MobileTicketCardProps {
  ticket: Ticket;
  hasNewMessages: boolean;
  messageCount: number;
  canClose: boolean;
  canReopen: boolean;
  timeRemaining?: number;
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

const MobileTicketCard = ({
  ticket,
  hasNewMessages,
  messageCount,
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
}: MobileTicketCardProps) => {
  const [showProgression, setShowProgression] = useState(false);
  const { classification, categoryType, acumaticaModule } = getTicketMetadata(ticket);
  const { hasDetailsChanged } = useTicketDetailsChanged(ticket.id);
  
  // Parse resolution notes safely
  let resolutionNotes: any[] = [];
  try {
    if (ticket.resolution_notes && Array.isArray(ticket.resolution_notes)) {
      resolutionNotes = ticket.resolution_notes.filter((note: any) => note?.note && note?.admin_name);
    }
  } catch (error) {
    console.error('Error parsing resolution notes:', error);
  }

  return (
    <Card className="mb-3 border border-border/50 shadow-sm">
      <CardContent className="p-4">
        {/* Header with ticket number and status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground">
                #{ticket.ticket_number}
              </span>
              {hasNewMessages && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2">
              {ticket.title}
            </h3>
          </div>
          <Badge 
            variant="secondary" 
            className={`${getStatusColor(ticket.status)} text-xs px-2 py-1 ml-2 flex-shrink-0`}
          >
            {ticket.status.replace('_', ' ')}
          </Badge>
        </div>

        {/* Metadata tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            {classification}
          </Badge>
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            {categoryType}
          </Badge>
          {acumaticaModule && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              {acumaticaModule}
            </Badge>
          )}
          {hasDetailsChanged && (
            <Badge className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 border-purple-200">
              <Edit3 className="w-3 h-3 mr-1" />
              Updated
            </Badge>
          )}
        </div>

        {/* Description preview */}
        <div className="mb-3">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {ticket.description?.replace(/<[^>]*>/g, '') || 'No description provided'}
          </p>
        </div>

        {/* Time info */}
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>
            Created {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Auto-close countdown */}
        {canClose && timeRemaining && timeRemaining > 0 && (
          <div className="mb-3 p-2 bg-orange-50 dark:bg-orange-950/20 rounded-md border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-orange-600" />
              <span className="text-xs text-orange-700 dark:text-orange-300">
                Auto-close in: {formatTimeRemaining(timeRemaining)}
              </span>
            </div>
          </div>
        )}

        {/* Assigned admin */}
        {ticket.assigned_admin_name && (
          <div className="mb-3 text-xs text-muted-foreground">
            <span className="font-medium">Assigned to:</span> {ticket.assigned_admin_name}
          </div>
        )}

        {/* Resolution Notes - compact mobile view */}
        {resolutionNotes.length > 0 && (
          <div className="mb-3 p-2 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                Resolution Notes ({resolutionNotes.length})
              </span>
            </div>
            <div className="space-y-1">
              {resolutionNotes.slice(0, 2).map((note: any, index: number) => (
                <div key={index} className="text-xs text-green-700 dark:text-green-300">
                  <span className="font-medium">{note.admin_name}:</span> 
                  <span className="ml-1 line-clamp-1">
                    {note.note.length > 50 ? `${note.note.substring(0, 50)}...` : note.note}
                  </span>
                </div>
              ))}
              {resolutionNotes.length > 2 && (
                <div className="text-xs text-green-600 dark:text-green-400 italic">
                  +{resolutionNotes.length - 2} more notes...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewTicket(ticket)}
            className={`flex-1 h-9 text-xs gap-1 ${hasNewMessages ? 'border-red-300 text-red-700' : ''}`}
          >
            <Eye className="w-3 h-3" />
            {hasNewMessages ? 'Open Chat' : 'View Ticket'}
            {hasNewMessages && messageCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-4 px-1 text-[10px]">
                {messageCount}
              </Badge>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowProgression(true)}
            className="flex-1 h-9 text-xs gap-1"
          >
            <GitBranch className="w-3 h-3" />
            Progression
          </Button>

          {canClose && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onCloseTicket(ticket.id, ticket.ticket_number)}
              disabled={isClosing}
              className="flex-1 h-9 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle className="w-3 h-3" />
              {isClosing ? 'Closing…' : 'Close Ticket'}
            </Button>
          )}

          {canReopen && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReopenTicket(ticket.id, ticket.ticket_number)}
              disabled={isReopening}
              className="flex-1 h-9 text-xs gap-1 border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              <RotateCcw className="w-3 h-3" />
              {isReopening ? 'Reopening…' : 'Reopen Ticket'}
            </Button>
          )}
        </div>

        {/* Ticket Progression Modal */}
        <TicketProgressionModal
          ticket={ticket}
          isOpen={showProgression}
          onClose={() => setShowProgression(false)}
        />
      </CardContent>
    </Card>
  );
};

export default MobileTicketCard;