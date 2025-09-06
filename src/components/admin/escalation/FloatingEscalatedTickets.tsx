
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, X } from 'lucide-react';
import { useEscalatedTickets } from './hooks/useEscalatedTickets';
import EscalatedTicketsContent from './EscalatedTicketsContent';

interface FloatingEscalatedTicketsProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketResolved: () => void;
}

const FloatingEscalatedTickets = ({ isOpen, onClose, onTicketResolved }: FloatingEscalatedTicketsProps) => {
  const {
    escalatedTickets,
    loading,
    resolvingTickets,
    handleResolveEscalation,
    user
  } = useEscalatedTickets(isOpen, onTicketResolved);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Escalated to Infosoft Dev ({escalatedTickets.length})
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[60vh]">
          <EscalatedTicketsContent
            loading={loading}
            escalatedTickets={escalatedTickets}
            resolvingTickets={resolvingTickets}
            userId={user?.id}
            onResolve={handleResolveEscalation}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FloatingEscalatedTickets;
