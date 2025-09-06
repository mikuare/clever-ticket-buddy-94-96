
import { useState, useEffect } from 'react';
import type { Ticket } from '@/hooks/useUserTickets';
import { calculateTimeRemaining } from './TicketTimerUtils';
import { useTicketActions } from './useTicketActions';
import { useAutoCloseSettings } from '@/hooks/useAutoCloseSettings';

interface TicketAutoCloseManagerProps {
  tickets: Ticket[];
  onTicketsUpdate: () => void;
  onTimersUpdate: (timers: Map<string, number>) => void;
}

export const useTicketAutoCloseManager = ({ tickets, onTicketsUpdate }: Omit<TicketAutoCloseManagerProps, 'onTimersUpdate'>) => {
  const [autoCloseTimers, setAutoCloseTimers] = useState<Map<string, number>>(new Map());
  const { handleCloseTicket } = useTicketActions(onTicketsUpdate);
  const { autoCloseHours } = useAutoCloseSettings();

  // Set up auto-close timers for resolved tickets
  useEffect(() => {
    console.log('Recalculating auto-close timers with hours:', autoCloseHours, 'for', tickets.length, 'tickets');
    const newTimers = new Map();
    
    tickets.forEach(ticket => {
      if (ticket.status === 'Resolved' && ticket.admin_resolved_at && !ticket.user_closed_at) {
        const timeRemaining = calculateTimeRemaining(ticket.admin_resolved_at, autoCloseHours);
        console.log(`Ticket ${ticket.ticket_number}: ${timeRemaining} seconds remaining (${autoCloseHours} hours setting) - Resolved at: ${ticket.admin_resolved_at}`);
        if (timeRemaining > 0) {
          newTimers.set(ticket.id, timeRemaining);
        } else {
          console.log(`Ticket ${ticket.ticket_number}: Timer expired, should auto-close`);
        }
      }
    });
    
    console.log('Setting auto-close timers:', Array.from(newTimers.entries()));
    setAutoCloseTimers(newTimers);
  }, [tickets, autoCloseHours]);

  // Update timers every second and auto-close when timer expires
  useEffect(() => {
    if (autoCloseTimers.size === 0) return;
    
    const interval = setInterval(() => {
      setAutoCloseTimers(prev => {
        const updated = new Map();
        
        for (const [ticketId, time] of prev) {
          const newTime = time - 1;
          if (newTime > 0) {
            updated.set(ticketId, newTime);
          } else {
            // Timer expired, auto-close ticket
            const expiredTicket = tickets.find(t => t.id === ticketId);
            if (expiredTicket) {
              console.log(`Auto-closing ticket ${expiredTicket.ticket_number} due to timer expiration`);
              handleCloseTicket(ticketId, expiredTicket.ticket_number);
            }
          }
        }
        
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoCloseTimers, handleCloseTicket, tickets]);

  return { autoCloseTimers, handleCloseTicket };
};
