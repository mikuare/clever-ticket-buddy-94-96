
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, UserPlus, CheckCircle, Clock, Zap } from 'lucide-react';
import ResolutionNoteDialog from '../ResolutionNoteDialog';
import { BookmarkButton } from '@/components/admin/BookmarkButton';
import type { Ticket } from '@/types/admin';

interface TicketActionsProps {
  ticket: Ticket;
  hasNewMessages: boolean;
  messageCount: number;
  canAssign: boolean;
  canResolve: boolean;
  shouldShowReferButton: boolean;
  canEscalate: boolean;
  isResolving: boolean;
  isClosed: boolean;
  showEscalateButton: boolean;
  isEscalated: boolean;
  onShowProgression: () => void;
  onViewDetails: () => void;
  onResolveTicket: (ticketId: string, ticketNumber: string, resolutionNote: string) => Promise<void>;
  onReferTicket: (ticket: Ticket) => void;
  onAssignTicket: (ticketId: string) => void;
  onEscalateTicket: (ticket: Ticket) => void;
  // Bookmark functionality
  isBookmarked?: boolean;
  bookmarkInfo?: {
    bookmark_title: string;
    created_at: string;
  };
  onBookmark?: (ticketId: string, title: string) => Promise<boolean>;
  onRemoveBookmark?: (ticketId: string) => Promise<boolean>;
}

const TicketActions = ({
  ticket,
  hasNewMessages,
  messageCount,
  canAssign,
  canResolve,
  shouldShowReferButton,
  canEscalate,
  isResolving,
  isClosed,
  showEscalateButton,
  isEscalated,
  onShowProgression,
  onViewDetails,
  onResolveTicket,
  onReferTicket,
  onAssignTicket,
  onEscalateTicket,
  isBookmarked = false,
  bookmarkInfo,
  onBookmark,
  onRemoveBookmark
}: TicketActionsProps) => {
  const [showResolutionDialog, setShowResolutionDialog] = useState(false);
  
  // Debounce rapid state changes to prevent flickering
  const [stableState, setStableState] = useState({
    canAssign,
    canResolve,
    shouldShowReferButton,
    canEscalate,
    showEscalateButton,
    isEscalated
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStableState({
        canAssign,
        canResolve,
        shouldShowReferButton,
        canEscalate,
        showEscalateButton,
        isEscalated
      });
    }, 500); // 500ms debounce

    return () => clearTimeout(timeout);
  }, [canAssign, canResolve, shouldShowReferButton, canEscalate, showEscalateButton, isEscalated]);

  const handleResolveClick = () => {
    setShowResolutionDialog(true);
  };

  const handleResolutionSubmit = async (resolutionNote: string) => {
    await onResolveTicket(ticket.id, ticket.ticket_number, resolutionNote);
    setShowResolutionDialog(false);
  };

  return (
    <div className="flex flex-col gap-2 ml-4 min-w-[400px]">
      {/* Fixed top row - always visible */}
      <div className="grid grid-cols-3 gap-2 w-full">
        <Button
          size="sm"
          variant="outline"
          onClick={onShowProgression}
          className="flex items-center gap-1 justify-center"
        >
          <Clock className="w-4 h-4" />
          Ticket Progression
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={onViewDetails}
          className={`flex items-center gap-1 relative justify-center ${hasNewMessages && !isClosed ? 'border-red-300 text-red-700 hover:bg-red-50' : ''}`}
        >
          <Eye className="w-4 h-4" />
          View Details
          {hasNewMessages && !isClosed && (
            <div className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium px-1">
                {messageCount}
              </span>
            </div>
          )}
        </Button>
        
        {/* Bookmark button */}
        <div className="flex justify-center">
          {onBookmark && onRemoveBookmark ? (
            <BookmarkButton
              ticketId={ticket.id}
              ticketNumber={ticket.ticket_number}
              ticketTitle={ticket.title}
              isBookmarked={isBookmarked}
              bookmarkInfo={bookmarkInfo}
              onBookmark={onBookmark}
              onRemoveBookmark={onRemoveBookmark}
            />
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      </div>
      
      {/* Fixed middle row - stable grid layout */}
      <div className="grid grid-cols-2 gap-2 w-full min-h-[36px]">
        {/* Resolve button - stable position */}
        <div className="flex">
          {stableState.canResolve && !stableState.isEscalated ? (
            <Button
              size="sm"
              onClick={handleResolveClick}
              disabled={isResolving}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white w-full justify-center"
            >
              <CheckCircle className="w-4 h-4" />
              {isResolving ? 'Resolving...' : 'Mark as Resolved'}
            </Button>
          ) : (
            <div className="w-full h-9 opacity-0 pointer-events-none" />
          )}
        </div>
        
        {/* Refer button - stable position */}
        <div className="flex">
          {stableState.shouldShowReferButton && !stableState.isEscalated ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReferTicket(ticket)}
              className="flex items-center gap-1 border-orange-300 text-orange-700 hover:bg-orange-50 w-full justify-center"
            >
              <UserPlus className="w-4 h-4" />
              Refer to Other Admin
            </Button>
          ) : (
            <div className="w-full h-9 opacity-0 pointer-events-none" />
          )}
        </div>
      </div>
      
      {/* Fixed bottom row - stable grid layout */}
      <div className="grid grid-cols-2 gap-2 w-full min-h-[36px]">
        {/* Assign button - stable position */}
        <div className="flex">
          {stableState.canAssign ? (
            <Button
              size="sm"
              onClick={() => onAssignTicket(ticket.id)}
              className="w-full justify-center"
            >
              Assign to Me
            </Button>
          ) : (
            <div className="w-full h-9 opacity-0 pointer-events-none" />
          )}
        </div>
        
        {/* Escalate button - stable position */}
        <div className="flex">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEscalateTicket(ticket)}
            disabled={!stableState.showEscalateButton || !stableState.canEscalate || stableState.isEscalated}
            className={`flex items-center gap-1 border-purple-300 text-purple-700 hover:bg-purple-50 w-full justify-center ${
              stableState.showEscalateButton && stableState.canEscalate && !stableState.isEscalated 
                ? 'opacity-100' 
                : 'opacity-30 pointer-events-none'
            }`}
          >
            <Zap className="w-4 h-4" />
            Escalate to Infosoft Dev
          </Button>
        </div>
      </div>
      
      <ResolutionNoteDialog
        isOpen={showResolutionDialog}
        onClose={() => setShowResolutionDialog(false)}
        onSubmit={handleResolutionSubmit}
        ticketNumber={ticket.ticket_number}
        isResolving={isResolving}
      />
    </div>
  );
};

export default TicketActions;
