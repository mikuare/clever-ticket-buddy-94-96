
import type { Json } from '@/integrations/supabase/types';

export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  department_code: string;
  user_id: string;
  assigned_admin_id?: string | null;
  assigned_admin_name?: string | null;
  attachments: Json;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  admin_resolved_at?: string | null;
  user_closed_at?: string | null;
  resolution_notes?: Json | null;
  isReopened?: boolean;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

export interface Department {
  code: string;
  name: string;
  image_url?: string;
}

export interface DepartmentNotification {
  department: Department;
  openTickets: Ticket[];
  criticalCount: number;
  highCount: number;
}

export interface UserNotification {
  user: {
    full_name: string;
    email: string;
    department_code: string;
  };
  openTickets: Ticket[];
  oldestTicket: Ticket;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  user_name: string;
  is_admin: boolean;
  message: string;
  attachments?: Json;
  audio_url?: string;
  audio_duration?: number;
  created_at: string;
  reply_to?: string | null;
  edited_at?: string | null;
  is_edited?: boolean;
  replied_message?: TicketMessage | null; // For joined data
}

export interface TypingStatus {
  id: string;
  ticket_id: string;
  user_id: string;
  user_name: string;
  is_admin: boolean;
  is_typing: boolean;
  updated_at: string;
}

export interface TicketReferral {
  id: string;
  ticket_id: string;
  referring_admin_id: string;
  referred_admin_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  message: string;
  created_at: string;
  responded_at?: string | null;
  ticket?: {
    ticket_number: string;
    title: string;
    priority: string;
    department_code: string;
  };
  referring_admin?: {
    full_name: string;
    email: string;
  };
}
