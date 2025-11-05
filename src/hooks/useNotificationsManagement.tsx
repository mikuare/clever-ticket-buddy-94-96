
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Ticket, Department, DepartmentNotification, UserNotification } from '@/types/admin';

export const useNotificationsManagement = (tickets: Ticket[], departments: Department[]) => {
  const [departmentNotifications, setDepartmentNotifications] = useState<DepartmentNotification[]>([]);
  const [userNotifications, setUserNotifications] = useState<UserNotification[]>([]);

  const generateNotifications = () => {
    const openTickets = tickets.filter(ticket => ticket.status === 'Open');
    
    // Department notifications
    const deptNotifications: DepartmentNotification[] = departments.map(dept => {
      const deptOpenTickets = openTickets.filter(ticket => ticket.department_code === dept.code);
      const criticalCount = deptOpenTickets.filter(ticket => ticket.priority === 'Critical').length;
      const highCount = deptOpenTickets.filter(ticket => ticket.priority === 'High').length;
      
      return {
        department: dept,
        openTickets: deptOpenTickets,
        criticalCount,
        highCount
      };
    }).filter(notification => notification.openTickets.length > 0);

    // User notifications - group by user
    const userTicketMap = new Map<string, { user: any, tickets: Ticket[] }>();
    
    openTickets.forEach(ticket => {
      if (ticket.profiles) {
        const userKey = ticket.user_id;
        if (!userTicketMap.has(userKey)) {
          userTicketMap.set(userKey, {
            user: {
              full_name: ticket.profiles.full_name,
              email: ticket.profiles.email,
              department_code: ticket.department_code
            },
            tickets: []
          });
        }
        userTicketMap.get(userKey)!.tickets.push(ticket);
      }
    });

    const userNotifs: UserNotification[] = Array.from(userTicketMap.values()).map(({ user, tickets: userTickets }) => {
      const sortedTickets = userTickets.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      return {
        user,
        openTickets: userTickets,
        oldestTicket: sortedTickets[0]
      };
    }).sort((a, b) => b.openTickets.length - a.openTickets.length);

    setDepartmentNotifications(deptNotifications);
    setUserNotifications(userNotifs);
  };

  // Real-time notifications update when tickets or departments change
  useEffect(() => {
    if (tickets.length > 0 && departments.length > 0) {
      console.log('Updating notifications in real-time...');
      generateNotifications();
    }
  }, [tickets, departments]);

  // Set up real-time subscription for profile updates (user changes)
  useEffect(() => {
    const channel = supabase
      .channel('admin-profile-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          console.log('Profile updated, refreshing notifications...');
          // Force regeneration when user profiles change
          if (tickets.length > 0 && departments.length > 0) {
            generateNotifications();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tickets.length, departments.length]);

  return {
    departmentNotifications,
    userNotifications
  };
};
