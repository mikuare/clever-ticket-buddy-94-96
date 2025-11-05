
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Bookmark {
  id: string;
  admin_id: string;
  original_ticket_id: string;
  bookmark_title: string;
  
  // Complete ticket data
  ticket_number: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  department_code: string;
  user_id: string;
  assigned_admin_id?: string | null;
  assigned_admin_name?: string | null;
  attachments: any;
  resolution_notes?: any | null;
  
  // Original ticket timestamps
  ticket_created_at: string;
  ticket_updated_at: string;
  resolved_at?: string | null;
  admin_resolved_at?: string | null;
  user_closed_at?: string | null;
  
  // User information
  user_full_name?: string | null;
  user_email?: string | null;
  
  // Bookmark metadata
  created_at: string;
  updated_at: string;
}

export const useAdminBookmarks = (adminId: string) => {
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarkedTicketIds, setBookmarkedTicketIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch all bookmarks for the admin
  const fetchBookmarks = useCallback(async () => {
    if (!adminId) return;

    try {
      const { data, error } = await supabase
        .from('admin_ticket_bookmarks')
        .select('*')
        .eq('admin_id', adminId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookmarks(data || []);
      setBookmarkedTicketIds(new Set(data?.map(b => b.original_ticket_id) || []));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast({
        title: "Error",
        description: "Failed to load bookmarks.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [adminId, toast]);

  // Add a bookmark - copy complete ticket data
  const addBookmark = useCallback(async (ticketId: string, bookmarkTitle: string) => {
    if (!adminId) return false;

    try {
      // First fetch the complete ticket data and user profile
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (ticketError) throw ticketError;

      // Fetch user profile separately
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', ticketData.user_id)
        .single();


      // Insert bookmark with complete ticket data
      const { data, error } = await supabase
        .from('admin_ticket_bookmarks')
        .insert({
          admin_id: adminId,
          original_ticket_id: ticketId,
          bookmark_title: bookmarkTitle,
          
          // Copy all ticket data
          ticket_number: ticketData.ticket_number,
          title: ticketData.title,
          description: ticketData.description,
          priority: ticketData.priority,
          status: ticketData.status,
          department_code: ticketData.department_code,
          user_id: ticketData.user_id,
          assigned_admin_id: ticketData.assigned_admin_id,
          assigned_admin_name: ticketData.assigned_admin_name,
          attachments: ticketData.attachments,
          resolution_notes: ticketData.resolution_notes,
          
          // Copy timestamps
          ticket_created_at: ticketData.created_at,
          ticket_updated_at: ticketData.updated_at,
          resolved_at: ticketData.resolved_at,
          admin_resolved_at: ticketData.admin_resolved_at,
          user_closed_at: ticketData.user_closed_at,
          
          // Copy user information
          user_full_name: profileData?.full_name,
          user_email: profileData?.email
        })
        .select()
        .single();

      if (error) throw error;

      setBookmarks(prev => [data, ...prev]);
      setBookmarkedTicketIds(prev => new Set([...prev, ticketId]));

      toast({
        title: "Bookmark Added",
        description: `Ticket bookmarked as "${bookmarkTitle}"`
      });

      return true;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to add bookmark. This ticket may already be bookmarked.",
        variant: "destructive"
      });
      return false;
    }
  }, [adminId, toast]);

  // Update a bookmark title
  const updateBookmark = useCallback(async (originalTicketId: string, newTitle: string) => {
    if (!adminId) return false;

    try {
      const { data, error } = await supabase
        .from('admin_ticket_bookmarks')
        .update({ bookmark_title: newTitle })
        .eq('admin_id', adminId)
        .eq('original_ticket_id', originalTicketId)
        .select()
        .single();

      if (error) throw error;

      setBookmarks(prev => prev.map(b => 
        b.original_ticket_id === originalTicketId ? { ...b, bookmark_title: newTitle } : b
      ));

      toast({
        title: "Bookmark Updated",
        description: `Bookmark label updated to "${newTitle}"`
      });

      return true;
    } catch (error) {
      console.error('Error updating bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark label.",
        variant: "destructive"
      });
      return false;
    }
  }, [adminId, toast]);

  // Remove a bookmark
  const removeBookmark = useCallback(async (originalTicketId: string) => {
    if (!adminId) return false;

    try {
      const { error } = await supabase
        .from('admin_ticket_bookmarks')
        .delete()
        .eq('admin_id', adminId)
        .eq('original_ticket_id', originalTicketId);

      if (error) throw error;

      setBookmarks(prev => prev.filter(b => b.original_ticket_id !== originalTicketId));
      setBookmarkedTicketIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(originalTicketId);
        return newSet;
      });

      toast({
        title: "Bookmark Removed",
        description: "Ticket bookmark has been removed."
      });

      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to remove bookmark.",
        variant: "destructive"
      });
      return false;
    }
  }, [adminId, toast]);

  // Check if a ticket is bookmarked
  const isBookmarked = useCallback((ticketId: string) => {
    return bookmarkedTicketIds.has(ticketId);
  }, [bookmarkedTicketIds]);

  // Get bookmark info for a ticket
  const getBookmarkInfo = useCallback((ticketId: string) => {
    return bookmarks.find(b => b.original_ticket_id === ticketId);
  }, [bookmarks]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return {
    bookmarks,
    loading,
    addBookmark,
    updateBookmark,
    removeBookmark,
    isBookmarked,
    getBookmarkInfo,
    refreshBookmarks: fetchBookmarks
  };
};
