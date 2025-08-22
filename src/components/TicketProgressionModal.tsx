
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, CheckCircle2, AlertCircle, Play, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ActivityItem } from './ticket-progression/ActivityItem';
import { useTicketProgression } from './ticket-progression/useTicketProgression';
import type { Ticket } from '@/types/admin';

interface TicketProgressionModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return <AlertCircle className="w-4 h-4 text-blue-600" />;
    case 'in progress':
      return <Play className="w-4 h-4 text-yellow-600" />;
    case 'resolved':
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case 'closed':
      return <XCircle className="w-4 h-4 text-gray-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'in progress':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'resolved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'closed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const TicketProgressionModal = ({ ticket, isOpen, onClose }: TicketProgressionModalProps) => {
  const { activities, loading, ticketCreator } = useTicketProgression(ticket, isOpen);

  if (!ticket) return null;

  // Filter out any activities that should not be displayed
  const displayableActivities = activities.filter(activity => {
    // Ensure activity has required fields
    if (!activity || !activity.id || !activity.activity_type) {
      return false;
    }
    
    // Always include details_updated activities
    if (activity.activity_type === 'details_updated') {
      console.log('Including details_updated activity:', activity);
      return true;
    }
    
    return true;
  });

  console.log('Final displayable activities:', displayableActivities);
  console.log('Details updated in displayable:', displayableActivities.filter(a => a.activity_type === 'details_updated'));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Ticket Progression - {ticket.ticket_number}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <div className="text-sm text-gray-600">
                <strong>Title:</strong> {ticket.title}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(ticket.status)}
              <Badge className={`${getStatusColor(ticket.status)} font-medium`}>
                Current Status: {ticket.status}
              </Badge>
            </div>
          </div>
          
          <ScrollArea className="h-96">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading progression...</div>
              </div>
            ) : displayableActivities.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">No progression data available</div>
              </div>
            ) : (
              <div className="space-y-4">
                {displayableActivities.map((activity, index) => (
                  <ActivityItem
                    key={`${activity.id}-${activity.created_at}-${index}`}
                    activity={activity}
                    ticketCreator={ticketCreator}
                    isLast={index === displayableActivities.length - 1}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketProgressionModal;
