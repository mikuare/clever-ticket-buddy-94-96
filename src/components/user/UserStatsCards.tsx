
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Ticket as TicketType } from '@/hooks/useUserTickets';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserStatsCardsProps {
  tickets: TicketType[];
}

const UserStatsCards = ({ tickets }: UserStatsCardsProps) => {
  const isMobile = useIsMobile();
  const openTickets = tickets.filter(ticket => ticket.status === 'Open').length;
  const inProgressTickets = tickets.filter(ticket => ticket.status === 'In Progress').length;
  const resolvedTickets = tickets.filter(ticket => ticket.status === 'Resolved').length;
  const closedTickets = tickets.filter(ticket => ticket.status === 'Closed').length;

  if (isMobile) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Ticket Overview</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 text-center">
              <Ticket className="h-5 w-5 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{tickets.length}</div>
              <p className="text-xs font-medium text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{openTickets}</div>
              <p className="text-xs font-medium text-muted-foreground">Open</p>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{inProgressTickets}</div>
              <p className="text-xs font-medium text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{resolvedTickets}</div>
              <p className="text-xs font-medium text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-8">
      {/* Left side - Ticket counters in horizontal layout */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Ticket Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tickets.length}</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{openTickets}</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{inProgressTickets}</div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{resolvedTickets}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting confirmation
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed</CardTitle>
              <XCircle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{closedTickets}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Completed
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserStatsCards;
