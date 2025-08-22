
import { useState, useMemo } from 'react';
import type { Ticket } from '@/types/admin';
import type { TicketFilterState } from '@/components/admin/TicketFilters';

export const useTicketFilters = (tickets: Ticket[], selectedDepartment: string, currentAdminId?: string) => {
  const [filters, setFilters] = useState<TicketFilterState>({
    assignmentFilter: 'all',
    statusFilter: 'all',
    includeOpen: true,
    includeInProgress: true,
    includeResolved: true,
    searchTerm: ''
  });

  // Date range filter state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const filteredTickets = useMemo(() => {
    let filtered = [...tickets];

    // Apply assignment filter with proper admin ID logic
    if (filters.assignmentFilter !== 'all' && currentAdminId) {
      switch (filters.assignmentFilter) {
        case 'assigned-to-me':
          filtered = filtered.filter(ticket => ticket.assigned_admin_id === currentAdminId);
          break;
        case 'assigned-to-others':
          filtered = filtered.filter(ticket => 
            ticket.assigned_admin_id && ticket.assigned_admin_id !== currentAdminId
          );
          break;
        case 'unassigned':
          filtered = filtered.filter(ticket => !ticket.assigned_admin_id);
          break;
      }
    }

    // Apply status filter with enhanced logic
    if (filters.statusFilter === 'active') {
      const allowedStatuses = [];
      if (filters.includeOpen) allowedStatuses.push('Open');
      if (filters.includeInProgress) allowedStatuses.push('In Progress');
      if (filters.includeResolved) allowedStatuses.push('Resolved');
      
      filtered = filtered.filter(ticket => allowedStatuses.includes(ticket.status));
    } else if (filters.statusFilter === 'closed') {
      filtered = filtered.filter(ticket => ticket.status === 'Closed');
    }

    // Apply date range filter
    if (startDate || endDate) {
      filtered = filtered.filter(ticket => {
        const ticketDate = new Date(ticket.created_at);
        const ticketDateOnly = new Date(ticketDate.getFullYear(), ticketDate.getMonth(), ticketDate.getDate());
        
        if (startDate && endDate) {
          const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
          return ticketDateOnly >= start && ticketDateOnly <= end;
        } else if (startDate) {
          const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          return ticketDateOnly >= start;
        } else if (endDate) {
          const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
          return ticketDateOnly <= end;
        }
        return true;
      });
    }

    // Apply search filter for ticket number, description, classification, category, and acumatica module
    if (filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(ticket => {
        try {
          // Search in ticket number and description
          const ticketNumber = (ticket.ticket_number || '').toLowerCase();
          const description = (ticket.description || '').toLowerCase();
          
          if (ticketNumber.includes(searchTerm) || description.includes(searchTerm)) {
            return true;
          }
          
          // Search in attachments (classification, category, module)
          const attachments = ticket.attachments as any;
          if (attachments && typeof attachments === 'object') {
            const classification = (attachments.classification || '').toLowerCase();
            const categoryType = (attachments.categoryType || '').toLowerCase();
            const acumaticaModule = (attachments.acumaticaModule || '').toLowerCase();
            
            return classification.includes(searchTerm) || 
                   categoryType.includes(searchTerm) || 
                   acumaticaModule.includes(searchTerm);
          }
          return false;
        } catch (error) {
          return false;
        }
      });
    }

    // Apply sorting (newest first)
    filtered.sort((a, b) => {
      const aValue = new Date(a.created_at).getTime();
      const bValue = new Date(b.created_at).getTime();
      return bValue - aValue;
    });

    return filtered;
  }, [tickets, filters, currentAdminId, startDate, endDate]);

  const departmentFilteredTickets = useMemo(() => {
    if (selectedDepartment === 'all') return filteredTickets;
    return filteredTickets.filter(ticket => ticket.department_code === selectedDepartment);
  }, [filteredTickets, selectedDepartment]);

  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  return {
    filters,
    setFilters,
    filteredTickets,
    departmentFilteredTickets,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    clearDateFilter
  };
};
