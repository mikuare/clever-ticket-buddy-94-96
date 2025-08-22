
import { supabase } from '@/integrations/supabase/client';
import type { ReferralNotification } from '@/types/referral';

export class ReferralService {
  static async fetchReferralNotifications(adminId: string): Promise<ReferralNotification[]> {
    const { data, error } = await supabase
      .from('ticket_referrals')
      .select(`
        *,
        ticket:tickets(ticket_number, title, priority, department_code),
        referring_admin:profiles!ticket_referrals_referring_admin_id_fkey(full_name, email, department_code),
        referred_admin:profiles!ticket_referrals_referred_admin_id_fkey(full_name, email, department_code)
      `)
      .eq('referred_admin_id', adminId)
      .in('status', ['pending', 'accepted', 'declined'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching referral notifications:', error);
      throw error;
    }

    return data || [];
  }

  static async fetchReferralsMadeByAdmin(adminId: string): Promise<ReferralNotification[]> {
    const { data, error } = await supabase
      .from('ticket_referrals')
      .select(`
        *,
        ticket:tickets(ticket_number, title, priority, department_code),
        referring_admin:profiles!ticket_referrals_referring_admin_id_fkey(full_name, email, department_code),
        referred_admin:profiles!ticket_referrals_referred_admin_id_fkey(full_name, email, department_code)
      `)
      .eq('referring_admin_id', adminId)
      .in('status', ['pending', 'accepted', 'declined'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching referrals made by admin:', error);
      throw error;
    }

    return data || [];
  }

  static async canReferTicket(ticketId: string): Promise<boolean> {
    try {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('status')
        .eq('id', ticketId)
        .single();

      if (error) {
        console.error('Error checking ticket status for referral:', error);
        return false;
      }

      // Prevent referral if ticket is resolved or closed
      return ticket.status !== 'Resolved' && ticket.status !== 'Closed';
    } catch (error) {
      console.error('Error checking if ticket can be referred:', error);
      return false;
    }
  }

  static async updateReferralStatus(referralId: string, status: 'accepted' | 'declined') {
    const { error } = await supabase
      .from('ticket_referrals')
      .update({ 
        status,
        responded_at: new Date().toISOString()
      })
      .eq('id', referralId);

    if (error) throw error;
  }

  static async updateTicketAssignment(ticketId: string, adminId: string, adminName?: string) {
    const { error } = await supabase
      .from('tickets')
      .update({ 
        assigned_admin_id: adminId,
        assigned_admin_name: adminName,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    if (error) throw error;
  }

  static async logTicketActivity(ticketId: string, adminId: string, activityType: string, description: string, adminName?: string, departmentCode?: string) {
    // If department code is not provided, fetch it
    let finalDepartmentCode = departmentCode;
    let finalAdminName = adminName;
    
    if (!finalDepartmentCode || !finalAdminName) {
      const { data: adminData } = await supabase
        .from('profiles')
        .select('full_name, department_code')
        .eq('id', adminId)
        .single();
      
      if (adminData) {
        finalDepartmentCode = finalDepartmentCode || adminData.department_code;
        finalAdminName = finalAdminName || adminData.full_name;
      }
    }

    const { error } = await supabase
      .from('ticket_activities')
      .insert({
        ticket_id: ticketId,
        user_id: adminId,
        activity_type: activityType,
        description,
        admin_name: finalAdminName,
        department_code: finalDepartmentCode
      });

    if (error) {
      console.error('Error logging ticket activity:', error);
      throw error;
    }
  }

  static async getAdminProfile(adminId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, department_code')
      .eq('id', adminId)
      .single();

    if (error) {
      console.error('Error fetching admin profile:', error);
      throw error;
    }
    
    return data;
  }
}
