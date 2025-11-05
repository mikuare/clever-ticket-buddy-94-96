
import type { Ticket } from '@/hooks/useUserTickets';

export const calculateStatusCounts = (tickets: Ticket[]) => {
  return {
    all: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    'in-progress': tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
    closed: tickets.filter(t => t.status === 'Closed').length
  };
};

export const filterTicketsByStatus = (tickets: Ticket[], filter: string) => {
  if (filter === 'all') return tickets;
  return tickets.filter(ticket => 
    ticket.status.toLowerCase().replace(' ', '-') === filter
  );
};
