import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageSquare, Clock, User, Bookmark, MoreVertical, CheckCircle, UserCheck, Paperclip, UserPlus, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Ticket } from '@/types/admin';
import ResolutionNotesDisplay from '../ticket-management/ResolutionNotesDisplay';
import { useTicketEscalation } from '../ticket-management/hooks/useTicketEscalation';

interface MobileAdminTicketCardProps {
  ticket: Ticket;
  hasNewMessage?: boolean;
  isBookmarked?: boolean;
  currentAdminId?: string;
  canRefer?: boolean;
  onOpenChat: () => void;
  onAssign: () => void;
  onResolve: () => void;
  onReferTicket?: () => void;
  onEscalate?: () => void;
  onShowProgression?: () => void;
  onBookmark?: () => void;
}

const MobileAdminTicketCard = ({
  ticket,
  hasNewMessage,
  isBookmarked,
  currentAdminId,
  canRefer = false,
  onOpenChat,
  onAssign,
  onResolve,
  onReferTicket,
  onEscalate,
  onShowProgression,
  onBookmark
}: MobileAdminTicketCardProps) => {
  const { isEscalated } = useTicketEscalation(ticket.id);
  // Check ticket assignment status
  const isAssignedToMe = ticket.assigned_admin_id === currentAdminId;
  const isAssignedToOther = ticket.assigned_admin_id && ticket.assigned_admin_id !== currentAdminId;
  const isUnassigned = !ticket.assigned_admin_id;
  
  // Check if actions are allowed
  const canAssign = isUnassigned && ticket.status.toLowerCase() === 'open';
  const isResolveEligible = isAssignedToMe && ticket.status.toLowerCase() === 'in progress';
  const canResolve = isResolveEligible && !isEscalated;
  const isResolved = ticket.status.toLowerCase() === 'resolved' || ticket.status.toLowerCase() === 'closed';
  const shouldShowReferButton = canRefer && !isResolved && !isEscalated;

  const getStatusColor = (status: string) => {
    const normalized = status
      .toLowerCase()
      .replace(/\s+/g, '-');

    switch (normalized) {
      case 'open':
        return 'bg-blue-500/10 text-blue-700 border border-blue-200';
      case 'in-progress':
        return 'bg-orange-500/10 text-orange-700 border border-orange-200';
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-700 border border-emerald-200';
      case 'closed':
        return 'bg-red-500/10 text-red-700 border border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border border-gray-200';
    }
  };

  // Check if ticket has attachments
  const getAttachmentsArray = (attachments: any) => {
    if (!attachments) return [];
    if (Array.isArray(attachments)) return attachments;
    if (typeof attachments === 'object' && attachments.files) {
      return Array.isArray(attachments.files) ? attachments.files : [];
    }
    return [];
  };

  const attachmentsArray = getAttachmentsArray(ticket.attachments);
  const hasAttachments = attachmentsArray.length > 0;

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
          </div>
          <h3 className="font-semibold text-sm text-foreground line-clamp-2">
            {ticket.title}
          </h3>
        </div>
      </div>

      {/* Description - Render HTML properly */}
      <div 
        className="text-xs text-muted-foreground mb-3 prose prose-sm max-w-none line-clamp-2"
        dangerouslySetInnerHTML={{ __html: ticket.description }}
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      />

      {/* Attachments Indicator */}
      {hasAttachments && (
        <div className="flex items-center gap-1 mb-2 text-xs text-blue-600">
          <Paperclip className="w-3 h-3" />
          <span>{attachmentsArray.length} attachment{attachmentsArray.length > 1 ? 's' : ''}</span>
        </div>
      )}

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

      {/* Assignment Status - Mobile Friendly */}
      {ticket.assigned_admin_name && (
        <div className={cn(
          "flex items-center gap-1.5 mb-3 text-xs px-2 py-1.5 rounded-md",
          isAssignedToMe 
            ? "bg-blue-50 text-blue-700 border border-blue-200" 
            : "bg-amber-50 text-amber-700 border border-amber-200"
        )}>
          <UserCheck className="w-3 h-3" />
          <span className="font-medium">
            {isAssignedToMe ? "Assigned to You" : `Assigned to ${ticket.assigned_admin_name}`}
          </span>
        </div>
      )}

      {isEscalated && (
        <div className="mb-3">
          <Badge className="bg-purple-100 text-purple-700 border border-purple-200 text-xs px-2 py-1">
            Escalated to Infosoft Dev
          </Badge>
        </div>
      )}

      {/* Resolution Notes - Match Web Version */}
      {ticket.resolution_notes && (
        <div className="mb-3">
          <ResolutionNotesDisplay resolutionNotes={ticket.resolution_notes} />
        </div>
      )}

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

          {/* Ticket Progression Button */}
          {onShowProgression && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onShowProgression}
            >
              <Clock className="w-4 h-4" />
            </Button>
          )}

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {onShowProgression && (
                <>
                  <DropdownMenuItem onClick={onShowProgression}>
                    <Clock className="w-4 h-4 mr-2" />
                    Ticket Progression
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {/* Always show Open Chat */}
              <DropdownMenuItem onClick={onOpenChat}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Open Chat
                {hasNewMessage && (
                  <Badge className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0">New</Badge>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Show Assign to Me only if unassigned and Open */}
              {canAssign && (
                <DropdownMenuItem onClick={onAssign}>
                  <User className="w-4 h-4 mr-2" />
                  Assign to Me
                </DropdownMenuItem>
              )}
              
              {/* Show info if assigned to someone else */}
              {isAssignedToOther && (
                <DropdownMenuItem disabled className="opacity-60">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Assigned to {ticket.assigned_admin_name}
                </DropdownMenuItem>
              )}
              
              {/* Show Mark Resolved only if assigned to current admin and In Progress */}
              {isResolveEligible && (
                <DropdownMenuItem
                  onClick={!isEscalated ? onResolve : undefined}
                  className={cn(!isEscalated ? 'text-green-700' : 'opacity-60')}
                  disabled={isEscalated}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Resolved
                </DropdownMenuItem>
              )}

              {isEscalated && (
                <DropdownMenuItem disabled className="opacity-60">
                  <Zap className="w-4 h-4 mr-2" />
                  Escalated to Infosoft Dev
                </DropdownMenuItem>
              )}
              
              {/* Show message if already resolved */}
              {isResolved && (
                <DropdownMenuItem disabled className="opacity-60">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Already {ticket.status}
                </DropdownMenuItem>
              )}
              
              {/* Show Refer to Other Admin option */}
              {shouldShowReferButton && onReferTicket && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onReferTicket} className="text-orange-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Refer to Other Admin
                  </DropdownMenuItem>
                </>
              )}
              
              {/* Show Escalate only if assigned to me and not resolved */}
              {onEscalate && isAssignedToMe && !isResolved && !isEscalated && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onEscalate} className="text-purple-700">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    Escalate to Infosoft
                  </DropdownMenuItem>
                </>
              )}
              
              {/* Bookmark */}
              {onBookmark && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onBookmark}>
                    <Bookmark className="w-4 h-4 mr-2" />
                    {isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
};

export default MobileAdminTicketCard;

