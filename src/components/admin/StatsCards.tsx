
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, CheckCircle, Clock, AlertTriangle, RotateCcw } from 'lucide-react';

interface StatsCardsProps {
  tickets: any[];
  stats?: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    reopened: number;
  };
}

const StatsCards = ({ tickets, stats }: StatsCardsProps) => {
  // Use provided stats or calculate from tickets array
  const totalTickets = stats?.total ?? tickets.length;
  const openTickets = stats?.open ?? tickets.filter(ticket => ticket.status === 'Open').length;
  const inProgressTickets = stats?.inProgress ?? tickets.filter(ticket => ticket.status === 'In Progress').length;
  const resolvedTickets = stats?.resolved ?? tickets.filter(ticket => ticket.status === 'Resolved').length;
  const closedTickets = stats?.closed ?? tickets.filter(ticket => ticket.status === 'Closed').length;
  
  // Calculate reopened tickets - tickets that have been reopened after being handled by admins but are NOT resolved or closed
  const reopenedTickets = stats?.reopened ?? (() => {
    // Count tickets that have reopen_count > 0, were handled by admins, and are not resolved or closed
    return tickets.filter(ticket => 
      ticket.reopen_count > 0 && 
      ticket.assigned_admin_id !== null &&
      ticket.status !== 'Resolved' &&
      ticket.status !== 'Closed'
    ).length;
  })();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTickets}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{openTickets}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{inProgressTickets}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reopened Tickets</CardTitle>
          <RotateCcw className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{reopenedTickets}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Active reopened tickets needing attention
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Closed Tickets</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{closedTickets}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {resolvedTickets} resolved, awaiting closure
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
