
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Ticket } from '@/types/admin';

interface InfosoftEscalationModalProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  onEscalated: () => void;
}

const InfosoftEscalationModal = ({ ticket, isOpen, onClose, onEscalated }: InfosoftEscalationModalProps) => {
  const { toast } = useToast();
  const [escalationReason, setEscalationReason] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);

  const handleEscalate = async () => {
    if (!ticket.assigned_admin_id) {
      toast({
        title: "Error",
        description: "Ticket must be assigned to escalate to Infosoft Dev",
        variant: "destructive"
      });
      return;
    }

    setIsEscalating(true);
    
    try {
      console.log(`Escalating ticket ${ticket.ticket_number} to Infosoft Dev`);
      
      const { error } = await supabase.rpc('create_infosoft_escalation', {
        p_ticket_id: ticket.id,
        p_escalated_by_admin_id: ticket.assigned_admin_id,
        p_escalation_reason: escalationReason || 'No specific reason provided'
      });

      if (error) {
        console.error('Error escalating ticket:', error);
        throw error;
      }

      toast({
        title: "Ticket Escalated",
        description: `Ticket ${ticket.ticket_number} has been escalated to Infosoft Dev. This ticket will not count toward your performance metrics.`,
      });

      onEscalated();
      onClose();
      setEscalationReason('');
    } catch (error: any) {
      console.error('Error escalating ticket:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to escalate ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEscalating(false);
    }
  };

  const handleClose = () => {
    if (!isEscalating) {
      setEscalationReason('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Escalate to Infosoft Dev
          </DialogTitle>
          <DialogDescription>
            Escalate this ticket to the Infosoft Development team for specialized assistance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important Notice:</p>
              <p>Escalated tickets will be excluded from your performance metrics and analytics. Only you will be able to mark this ticket as resolved once the Infosoft team provides a solution.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="escalation-reason">Escalation Reason (Optional)</Label>
            <Textarea
              id="escalation-reason"
              placeholder="Briefly describe why this ticket needs Infosoft Dev attention..."
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <strong>Ticket:</strong> {ticket.ticket_number} - {ticket.title}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isEscalating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEscalate}
            disabled={isEscalating}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isEscalating ? 'Escalating...' : 'Escalate to Infosoft Dev'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InfosoftEscalationModal;
