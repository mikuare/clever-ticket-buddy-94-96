export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      acumatica_modules: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_message_reads: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          last_read_at: string
          ticket_id: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          last_read_at?: string
          ticket_id: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          last_read_at?: string
          ticket_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_performance_metrics: {
        Row: {
          admin_id: string
          created_at: string
          department_code: string | null
          id: string
          resolution_time_hours: number | null
          resolved_at: string
          response_time_hours: number | null
          ticket_id: string
          ticket_number: string
          ticket_priority: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string
          department_code?: string | null
          id?: string
          resolution_time_hours?: number | null
          resolved_at: string
          response_time_hours?: number | null
          ticket_id: string
          ticket_number: string
          ticket_priority?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string
          department_code?: string | null
          id?: string
          resolution_time_hours?: number | null
          resolved_at?: string
          response_time_hours?: number | null
          ticket_id?: string
          ticket_number?: string
          ticket_priority?: string | null
        }
        Relationships: []
      }
      admin_ticket_bookmarks: {
        Row: {
          admin_id: string
          admin_resolved_at: string | null
          assigned_admin_id: string | null
          assigned_admin_name: string | null
          attachments: Json | null
          bookmark_title: string
          created_at: string
          department_code: string
          description: string
          id: string
          original_ticket_id: string
          priority: string
          resolution_notes: Json | null
          resolved_at: string | null
          status: string
          ticket_created_at: string
          ticket_number: string
          ticket_updated_at: string
          title: string
          updated_at: string
          user_closed_at: string | null
          user_email: string | null
          user_full_name: string | null
          user_id: string
        }
        Insert: {
          admin_id: string
          admin_resolved_at?: string | null
          assigned_admin_id?: string | null
          assigned_admin_name?: string | null
          attachments?: Json | null
          bookmark_title: string
          created_at?: string
          department_code: string
          description: string
          id?: string
          original_ticket_id: string
          priority: string
          resolution_notes?: Json | null
          resolved_at?: string | null
          status: string
          ticket_created_at: string
          ticket_number: string
          ticket_updated_at: string
          title: string
          updated_at?: string
          user_closed_at?: string | null
          user_email?: string | null
          user_full_name?: string | null
          user_id: string
        }
        Update: {
          admin_id?: string
          admin_resolved_at?: string | null
          assigned_admin_id?: string | null
          assigned_admin_name?: string | null
          attachments?: Json | null
          bookmark_title?: string
          created_at?: string
          department_code?: string
          description?: string
          id?: string
          original_ticket_id?: string
          priority?: string
          resolution_notes?: Json | null
          resolved_at?: string | null
          status?: string
          ticket_created_at?: string
          ticket_number?: string
          ticket_updated_at?: string
          title?: string
          updated_at?: string
          user_closed_at?: string | null
          user_email?: string | null
          user_full_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      brand_logos: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      branding_images: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number | null
          id: string
          image_type: string
          image_url: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_type?: string
          image_url: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_type?: string
          image_url?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      department_auth_keys: {
        Row: {
          auth_key: string
          created_at: string
          created_by: string | null
          department_code: string
          id: string
          updated_at: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          created_by?: string | null
          department_code: string
          id?: string
          updated_at?: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          created_by?: string | null
          department_code?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          code: string
          created_at: string
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      digitalization_team: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean
          job_title: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean
          job_title: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean
          job_title?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      infosoft_escalations: {
        Row: {
          created_at: string
          escalated_at: string
          escalated_by_admin_id: string
          escalation_reason: string | null
          id: string
          resolved_at: string | null
          status: string
          ticket_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          escalated_at?: string
          escalated_by_admin_id: string
          escalation_reason?: string | null
          id?: string
          resolved_at?: string | null
          status?: string
          ticket_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          escalated_at?: string
          escalated_by_admin_id?: string
          escalation_reason?: string | null
          id?: string
          resolved_at?: string | null
          status?: string
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "infosoft_escalations_escalated_by_admin_id_fkey"
            columns: ["escalated_by_admin_id"]
            isOneToOne: false
            referencedRelation: "admin_analytics_view"
            referencedColumns: ["admin_id"]
          },
          {
            foreignKeyName: "infosoft_escalations_escalated_by_admin_id_fkey"
            columns: ["escalated_by_admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "infosoft_escalations_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      it_team: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean
          job_title: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean
          job_title: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean
          job_title?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_sessions: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_time: string | null
          id: string
          is_active: boolean
          is_immediate: boolean
          start_time: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean
          is_immediate?: boolean
          start_time?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean
          is_immediate?: boolean
          start_time?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      post_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          post_id: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          post_id: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          post_id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          admin_id: string
          admin_name: string
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          admin_name: string
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          admin_name?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department_code: string
          email: string
          full_name: string
          id: string
          is_admin: boolean
          is_suspended: boolean
          mobile_number: string | null
          show_on_main_page: boolean | null
          social_media_links: Json | null
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department_code: string
          email: string
          full_name: string
          id: string
          is_admin?: boolean
          is_suspended?: boolean
          mobile_number?: string | null
          show_on_main_page?: boolean | null
          social_media_links?: Json | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department_code?: string
          email?: string
          full_name?: string
          id?: string
          is_admin?: boolean
          is_suspended?: boolean
          mobile_number?: string | null
          show_on_main_page?: boolean | null
          social_media_links?: Json | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_code_fkey"
            columns: ["department_code"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "profiles_suspended_by_fkey"
            columns: ["suspended_by"]
            isOneToOne: false
            referencedRelation: "admin_analytics_view"
            referencedColumns: ["admin_id"]
          },
          {
            foreignKeyName: "profiles_suspended_by_fkey"
            columns: ["suspended_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reaction_cooldowns: {
        Row: {
          created_at: string
          id: string
          last_removal_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_removal_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_removal_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      ticket_activities: {
        Row: {
          activity_type: string
          admin_name: string | null
          created_at: string
          department_code: string | null
          description: string
          id: string
          new_value: string | null
          old_value: string | null
          ticket_id: string
          user_id: string
        }
        Insert: {
          activity_type: string
          admin_name?: string | null
          created_at?: string
          department_code?: string | null
          description: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          ticket_id: string
          user_id: string
        }
        Update: {
          activity_type?: string
          admin_name?: string | null
          created_at?: string
          department_code?: string | null
          description?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_activities_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_categories: {
        Row: {
          classification_id: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          classification_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          classification_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_categories_classification_id_fkey"
            columns: ["classification_id"]
            isOneToOne: false
            referencedRelation: "ticket_classifications"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_classifications: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          attachments: Json | null
          audio_duration: number | null
          audio_url: string | null
          created_at: string
          id: string
          is_admin: boolean
          message: string
          ticket_id: string
          user_id: string
          user_name: string
        }
        Insert: {
          attachments?: Json | null
          audio_duration?: number | null
          audio_url?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean
          message: string
          ticket_id: string
          user_id: string
          user_name: string
        }
        Update: {
          attachments?: Json | null
          audio_duration?: number | null
          audio_url?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean
          message?: string
          ticket_id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_referrals: {
        Row: {
          created_at: string
          id: string
          message: string
          referred_admin_id: string
          referring_admin_id: string
          responded_at: string | null
          status: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          referred_admin_id: string
          referring_admin_id: string
          responded_at?: string | null
          status?: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          referred_admin_id?: string
          referring_admin_id?: string
          responded_at?: string | null
          status?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_referrals_referred_admin_id_fkey"
            columns: ["referred_admin_id"]
            isOneToOne: false
            referencedRelation: "admin_analytics_view"
            referencedColumns: ["admin_id"]
          },
          {
            foreignKeyName: "ticket_referrals_referred_admin_id_fkey"
            columns: ["referred_admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_referrals_referring_admin_id_fkey"
            columns: ["referring_admin_id"]
            isOneToOne: false
            referencedRelation: "admin_analytics_view"
            referencedColumns: ["admin_id"]
          },
          {
            foreignKeyName: "ticket_referrals_referring_admin_id_fkey"
            columns: ["referring_admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_referrals_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          admin_resolved_at: string | null
          assigned_admin_id: string | null
          assigned_admin_name: string | null
          attachments: Json | null
          created_at: string
          department_code: string
          description: string
          id: string
          priority: string
          reopen_count: number
          resolution_notes: Json | null
          resolved_at: string | null
          status: string
          ticket_number: string
          title: string
          updated_at: string
          user_closed_at: string | null
          user_id: string
        }
        Insert: {
          admin_resolved_at?: string | null
          assigned_admin_id?: string | null
          assigned_admin_name?: string | null
          attachments?: Json | null
          created_at?: string
          department_code: string
          description: string
          id?: string
          priority: string
          reopen_count?: number
          resolution_notes?: Json | null
          resolved_at?: string | null
          status?: string
          ticket_number: string
          title: string
          updated_at?: string
          user_closed_at?: string | null
          user_id: string
        }
        Update: {
          admin_resolved_at?: string | null
          assigned_admin_id?: string | null
          assigned_admin_name?: string | null
          attachments?: Json | null
          created_at?: string
          department_code?: string
          description?: string
          id?: string
          priority?: string
          reopen_count?: number
          resolution_notes?: Json | null
          resolved_at?: string | null
          status?: string
          ticket_number?: string
          title?: string
          updated_at?: string
          user_closed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_department_code_fkey"
            columns: ["department_code"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["code"]
          },
        ]
      }
      user_cooldowns: {
        Row: {
          classification: string
          id: string
          last_ticket_time: string
          user_id: string
        }
        Insert: {
          classification: string
          id?: string
          last_ticket_time?: string
          user_id: string
        }
        Update: {
          classification?: string
          id?: string
          last_ticket_time?: string
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          created_at: string
          department_code: string
          full_name: string
          id: string
          is_admin: boolean
          is_online: boolean
          last_seen: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department_code: string
          full_name: string
          id?: string
          is_admin?: boolean
          is_online?: boolean
          last_seen?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department_code?: string
          full_name?: string
          id?: string
          is_admin?: boolean
          is_online?: boolean
          last_seen?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_analytics: {
        Row: {
          avg_resolution_hours: number | null
          closed_tickets: number | null
          date: string | null
          in_progress_tickets: number | null
          open_tickets: number | null
          resolved_tickets: number | null
          total_tickets: number | null
        }
        Relationships: []
      }
      admin_analytics_view: {
        Row: {
          admin_id: string | null
          admin_name: string | null
          avg_resolution_time_hours: number | null
          avg_response_time_hours: number | null
          email: string | null
          tickets_escalated: number | null
          tickets_in_progress: number | null
          tickets_resolved: number | null
          total_tickets_catered: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      auto_close_resolved_tickets: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_reaction_cooldown: {
        Args: { p_post_id: string; p_user_id: string }
        Returns: boolean
      }
      check_referral_cooldown: {
        Args: { p_admin_id: string; p_ticket_id: string }
        Returns: boolean
      }
      cleanup_expired_password_resets: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_infosoft_escalation: {
        Args: {
          p_escalated_by_admin_id: string
          p_escalation_reason?: string
          p_ticket_id: string
        }
        Returns: string
      }
      delete_referral_notification: {
        Args: { admin_id: string; referral_id: string }
        Returns: boolean
      }
      disable_expired_maintenance_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      disable_immediate_maintenance: {
        Args: { p_admin_id?: string }
        Returns: boolean
      }
      enable_immediate_maintenance: {
        Args: { p_admin_id?: string; p_description?: string; p_title?: string }
        Returns: string
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_admin_analytics_by_date_range: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          admin_id: string
          admin_name: string
          avg_resolution_time_hours: number
          avg_response_time_hours: number
          email: string
          tickets_escalated: number
          tickets_in_progress: number
          tickets_resolved: number
          total_tickets_catered: number
        }[]
      }
      get_admin_summary_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_resolution_time_hours: number
          avg_response_time_hours: number
          total_tickets_all_admins: number
          total_tickets_in_progress: number
        }[]
      }
      get_admin_summary_stats_by_date_range: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          avg_resolution_time_hours: number
          avg_response_time_hours: number
          total_tickets_all_admins: number
          total_tickets_escalated_to_dev: number
          total_tickets_in_progress: number
        }[]
      }
      get_consolidated_ticket_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          closed_count: number
          in_progress_count: number
          open_count: number
          reopened_count: number
          resolved_count: number
          total_count: number
        }[]
      }
      get_consolidated_ticket_stats_by_department: {
        Args: { p_department_code?: string }
        Returns: {
          closed_count: number
          in_progress_count: number
          open_count: number
          reopened_count: number
          resolved_count: number
          total_count: number
        }[]
      }
      get_department_ticket_stats: {
        Args: { p_admin_id?: string }
        Returns: {
          closed_tickets: number
          department_code: string
          department_name: string
          in_progress_tickets: number
          open_tickets: number
          reopened_tickets: number
          resolved_tickets: number
          total_tickets: number
          unread_message_count: number
        }[]
      }
      get_escalated_tickets: {
        Args: Record<PropertyKey, never>
        Returns: {
          escalated_at: string
          escalated_by_admin_id: string
          escalated_by_admin_name: string
          escalation_id: string
          escalation_reason: string
          resolution_notes: Json
          ticket_created_at: string
          ticket_department_code: string
          ticket_description: string
          ticket_id: string
          ticket_number: string
          ticket_priority: string
          ticket_title: string
          user_email: string
          user_full_name: string
        }[]
      }
      get_tickets_by_department_paginated: {
        Args: {
          p_admin_id?: string
          p_department_code?: string
          p_page_limit?: number
          p_page_offset?: number
        }
        Returns: {
          admin_resolved_at: string
          assigned_admin_id: string
          assigned_admin_name: string
          attachments: Json
          created_at: string
          department_code: string
          description: string
          has_unread_messages: boolean
          id: string
          is_reopened: boolean
          priority: string
          reopen_count: number
          resolution_notes: Json
          resolved_at: string
          status: string
          ticket_number: string
          title: string
          updated_at: string
          user_closed_at: string
          user_email: string
          user_full_name: string
          user_id: string
        }[]
      }
      get_tickets_optimized_for_admin: {
        Args: {
          p_admin_id?: string
          p_department_code?: string
          p_page_limit?: number
          p_page_offset?: number
        }
        Returns: {
          admin_resolved_at: string
          assigned_admin_id: string
          assigned_admin_name: string
          attachments: Json
          created_at: string
          department_code: string
          description: string
          has_unread_messages: boolean
          id: string
          is_reopened: boolean
          priority: string
          reopen_count: number
          resolution_notes: Json
          resolved_at: string
          status: string
          ticket_number: string
          title: string
          updated_at: string
          user_closed_at: string
          user_email: string
          user_full_name: string
          user_id: string
        }[]
      }
      get_tickets_with_profiles: {
        Args: { page_limit?: number; page_offset?: number }
        Returns: {
          admin_resolved_at: string
          assigned_admin_id: string
          assigned_admin_name: string
          attachments: Json
          created_at: string
          department_code: string
          description: string
          id: string
          is_reopened: boolean
          priority: string
          reopen_count: number
          resolution_notes: Json
          resolved_at: string
          status: string
          ticket_number: string
          title: string
          updated_at: string
          user_closed_at: string
          user_email: string
          user_full_name: string
          user_id: string
        }[]
      }
      is_system_in_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: {
          in_maintenance: boolean
          maintenance_description: string
          maintenance_end_time: string
          maintenance_title: string
        }[]
      }
      is_user_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      manage_user_suspension: {
        Args: {
          p_admin_id?: string
          p_reason?: string
          p_suspend: boolean
          p_user_id: string
        }
        Returns: boolean
      }
      resolve_infosoft_escalation: {
        Args: { p_admin_id: string; p_escalation_id: string }
        Returns: boolean
      }
      resolve_infosoft_escalation_with_notes: {
        Args: {
          p_admin_id: string
          p_escalation_id: string
          p_resolution_note: string
        }
        Returns: boolean
      }
      schedule_maintenance_session: {
        Args: {
          p_admin_id?: string
          p_description?: string
          p_end_time?: string
          p_start_time: string
          p_title: string
        }
        Returns: string
      }
      update_admin_message_read_status: {
        Args: { p_admin_id?: string; p_ticket_id: string }
        Returns: undefined
      }
      update_user_presence: {
        Args: {
          p_department_code: string
          p_full_name: string
          p_is_admin?: boolean
          p_is_online: boolean
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      referral_status:
        | "pending"
        | "accepted"
        | "declined"
        | "cancelled"
        | "withdrawn"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      referral_status: [
        "pending",
        "accepted",
        "declined",
        "cancelled",
        "withdrawn",
      ],
    },
  },
} as const
