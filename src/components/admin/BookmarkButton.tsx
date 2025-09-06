
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { BookmarkTicketDialog } from './BookmarkTicketDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BookmarkButtonProps {
  ticketId: string;
  ticketNumber: string;
  ticketTitle: string;
  isBookmarked: boolean;
  bookmarkInfo?: {
    bookmark_title: string;
    created_at: string;
  };
  onBookmark: (ticketId: string, title: string) => Promise<boolean>;
  onRemoveBookmark: (ticketId: string) => Promise<boolean>;
  className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  ticketId,
  ticketNumber,
  ticketTitle,
  isBookmarked,
  bookmarkInfo,
  onBookmark,
  onRemoveBookmark,
  className = ""
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBookmark = async (title: string) => {
    setIsProcessing(true);
    try {
      const success = await onBookmark(ticketId, title);
      if (success) {
        setIsDialogOpen(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveBookmark = async () => {
    setIsProcessing(true);
    try {
      await onRemoveBookmark(ticketId);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = () => {
    if (isBookmarked) {
      handleRemoveBookmark();
    } else {
      setIsDialogOpen(true);
    }
  };

  const tooltipContent = isBookmarked 
    ? `Remove bookmark: "${bookmarkInfo?.bookmark_title}"`
    : "Add bookmark";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            disabled={isProcessing}
            className={`h-8 w-8 p-0 ${className}`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>

      <BookmarkTicketDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleBookmark}
        ticketNumber={ticketNumber}
        ticketTitle={ticketTitle}
      />
    </TooltipProvider>
  );
};
