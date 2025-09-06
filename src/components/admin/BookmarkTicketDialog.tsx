import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bookmark } from "lucide-react";

interface BookmarkTicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string) => Promise<void>;
  ticketNumber: string;
  ticketTitle: string;
}

export const BookmarkTicketDialog: React.FC<BookmarkTicketDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  ticketNumber,
  ticketTitle
}) => {
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookmarkTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await onConfirm(bookmarkTitle.trim());
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setBookmarkTitle('');
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  // Auto-suggest a bookmark title based on ticket info
  React.useEffect(() => {
    if (isOpen && !bookmarkTitle) {
      setBookmarkTitle(`${ticketNumber} - ${ticketTitle.substring(0, 30)}${ticketTitle.length > 30 ? '...' : ''}`);
    }
  }, [isOpen, ticketNumber, ticketTitle, bookmarkTitle]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            Bookmark Ticket
          </DialogTitle>
          <DialogDescription>
            Add a custom label for this bookmark to help you find it later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bookmark-title">
                Bookmark Label <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bookmark-title"
                value={bookmarkTitle}
                onChange={(e) => setBookmarkTitle(e.target.value)}
                placeholder="Enter a descriptive label for this bookmark"
                maxLength={100}
                required
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                {bookmarkTitle.length}/100 characters
              </p>
            </div>
            
            <div className="space-y-1 p-3 bg-muted/50 rounded-md">
              <p className="text-sm font-medium">Ticket Details:</p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">{ticketNumber}</span> - {ticketTitle}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!bookmarkTitle.trim() || isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? "Saving..." : "Save Bookmark"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};