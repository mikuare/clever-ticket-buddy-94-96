import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageSquare, Clock, User, Bookmark, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Ticket } from '@/types/admin';

interface MobileAdminTicketCardProps {
  ticket: Ticket;
  hasNewMessage?: boolean;
  isBookmarked?: boolean;
  onOpenChat: () => void;
  onAssign: () => void;
  onResolve: () => void;
  onEscalate?: () => void;
  onBookmark?: () => void;
}

const MobileAdminTicketCard = ({
  ticket,
  hasNewMessage,
  isBookmarked,
  onOpenChat,
  onAssign,
  onResolve,
  onEscalate,
  onBookmark
}: MobileAdminTicketCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'in-progress':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'resolved':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'closed':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-600 text-white';
      case 'medium':
        return 'bg-yellow-600 text-white';
      case 'low':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <Card className="p-3 hover:shadow-md transition-shadow active:scale-[0.98] relative">
      {/* Bookmark Indicator */}
      {isBookmarked && (
        <div className="absolute top-2 right-2">
          <Bookmark className="w-4 h-4 fill-yellow-500 text-yellow-500" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 mr-6">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs font-mono px-1.5 py-0">
              {ticket.ticket_number}
            </Badge>
            <Badge className={cn('text-xs px-1.5 py-0', getPriorityColor(ticket.priority))}>
              {ticket.priority}
            </Badge>
          </div>
          <h3 className="font-semibold text-sm text-foreground line-clamp-2">
            {ticket.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
        {ticket.description}
      </p>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-2 mb-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          <span className="truncate max-w-[100px]">{ticket.user_name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
        </div>
        {ticket.department_name && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            {ticket.department_name}
          </Badge>
        )}
      </div>

      {/* Status & Actions */}
      <div className="flex items-center justify-between">
        <Badge className={cn('text-xs px-2 py-0.5', getStatusColor(ticket.status))}>
          {ticket.status}
        </Badge>

        <div className="flex items-center gap-1">
          {/* Chat Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 relative"
            onClick={onOpenChat}
          >
            <MessageSquare className="w-4 h-4" />
            {hasNewMessage && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white" />
            )}
          </Button>

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onOpenChat}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Open Chat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAssign}>
                <User className="w-4 h-4 mr-2" />
                Assign to Me
              </DropdownMenuItem>
              {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                <DropdownMenuItem onClick={onResolve}>
                  <Clock className="w-4 h-4 mr-2" />
                  Mark Resolved
                </DropdownMenuItem>
              )}
              {onEscalate && (
                <DropdownMenuItem onClick={onEscalate}>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  Escalate
                </DropdownMenuItem>
              )}
              {onBookmark && (
                <DropdownMenuItem onClick={onBookmark}>
                  <Bookmark className="w-4 h-4 mr-2" />
                  {isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
};

export default MobileAdminTicketCard;

