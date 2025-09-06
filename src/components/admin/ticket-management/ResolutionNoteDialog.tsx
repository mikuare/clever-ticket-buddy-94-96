import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, Loader2 } from 'lucide-react';

interface ResolutionNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
  ticketNumber: string;
  isResolving: boolean;
}

const ResolutionNoteDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  ticketNumber, 
  isResolving 
}: ResolutionNoteDialogProps) => {
  const [resolutionNote, setResolutionNote] = useState('');

  const handleSubmit = async () => {
    if (resolutionNote.trim()) {
      await onSubmit(resolutionNote);
      setResolutionNote('');
      onClose();
    }
  };

  const handleClose = () => {
    setResolutionNote('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Mark Ticket as Resolved
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              You are about to mark ticket <span className="font-semibold">{ticketNumber}</span> as resolved.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="resolution-note">
                Resolution Note <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="resolution-note"
                placeholder="Describe the actions taken to resolve this ticket..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Explain what steps were taken to resolve the issue. This will be visible to the user.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isResolving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!resolutionNote.trim() || isResolving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isResolving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resolving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Resolved
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResolutionNoteDialog;