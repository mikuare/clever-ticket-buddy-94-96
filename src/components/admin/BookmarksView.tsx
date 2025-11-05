
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Bookmark, 
  BookmarkX, 
  Search, 
  X,
  Edit2,
  Check,
  XCircle
} from 'lucide-react';
import { useAdminBookmarks } from '@/hooks/useAdminBookmarks';
import { useAuth } from '@/hooks/useAuth';
import TicketBadges from './ticket-management/components/TicketBadges';
import TicketInfo from './ticket-management/components/TicketInfo';
import TicketAttachments from './ticket-management/components/TicketAttachments';
import ResolutionNotesDisplay from './ticket-management/ResolutionNotesDisplay';
import type { Ticket } from '@/types/admin';

interface BookmarksViewProps {
  onOpenTicket?: (ticket: any) => void;
}

const BookmarksView: React.FC<BookmarksViewProps> = ({ onOpenTicket }) => {
  const { user } = useAuth();
  const {
    bookmarks,
    loading,
    removeBookmark,
    updateBookmark,
    refreshBookmarks
  } = useAdminBookmarks(user?.id || '');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBookmark, setEditingBookmark] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Filter bookmarks based on search term
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const searchLower = searchTerm.toLowerCase();
    
    return (
      bookmark.bookmark_title.toLowerCase().includes(searchLower) ||
      bookmark.ticket_number.toLowerCase().includes(searchLower) ||
      bookmark.title.toLowerCase().includes(searchLower) ||
      bookmark.department_code.toLowerCase().includes(searchLower) ||
      bookmark.description.toLowerCase().includes(searchLower)
    );
  });

  const handleRemoveBookmark = async (originalTicketId: string) => {
    await removeBookmark(originalTicketId);
  };

  const handleEditBookmark = (bookmark: any) => {
    setEditingBookmark(bookmark.original_ticket_id);
    setEditTitle(bookmark.bookmark_title);
  };

  const handleSaveEdit = async (originalTicketId: string) => {
    if (editTitle.trim()) {
      const success = await updateBookmark(originalTicketId, editTitle.trim());
      if (success) {
        setEditingBookmark(null);
        setEditTitle('');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingBookmark(null);
    setEditTitle('');
  };

  // Convert bookmark to ticket format for consistency
  const convertBookmarkToTicket = (bookmark: any): Ticket => ({
    id: bookmark.original_ticket_id,
    ticket_number: bookmark.ticket_number,
    title: bookmark.title,
    description: bookmark.description,
    priority: bookmark.priority,
    status: bookmark.status,
    department_code: bookmark.department_code,
    user_id: bookmark.user_id,
    assigned_admin_id: bookmark.assigned_admin_id,
    assigned_admin_name: bookmark.assigned_admin_name,
    attachments: bookmark.attachments,
    created_at: bookmark.ticket_created_at,
    updated_at: bookmark.ticket_updated_at,
    resolved_at: bookmark.resolved_at,
    admin_resolved_at: bookmark.admin_resolved_at,
    user_closed_at: bookmark.user_closed_at,
    resolution_notes: bookmark.resolution_notes,
    profiles: {
      full_name: bookmark.user_full_name || 'Unknown',
      email: bookmark.user_email || ''
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bookmark className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">My Bookmarked Tickets</h1>
          <Badge variant="secondary" className="text-sm">
            {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bookmarks by title, ticket number, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Bookmarks List */}
      {filteredBookmarks.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {bookmarks.length === 0 ? 'No bookmarks yet' : 'No matching bookmarks'}
            </h3>
            <p className="text-muted-foreground">
              {bookmarks.length === 0 
                ? 'Start bookmarking tickets to keep track of important cases.'
                : 'Try adjusting your search terms to find the bookmarks you\'re looking for.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBookmarks.map((bookmark) => {
            const ticket = convertBookmarkToTicket(bookmark);
            const isClosed = bookmark.status === 'Closed';
            
            return (
              <div key={bookmark.id} className="space-y-3">
                {/* Bookmark Label and Actions */}
                <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/20 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-amber-600" />
                    {editingBookmark === bookmark.original_ticket_id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="text-sm font-medium"
                          maxLength={100}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleSaveEdit(bookmark.original_ticket_id)}
                          disabled={!editTitle.trim()}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        {bookmark.bookmark_title}
                      </span>
                    )}
                  </div>
                  
                  {editingBookmark !== bookmark.original_ticket_id && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBookmark(bookmark)}
                        className="text-amber-700 hover:text-amber-800 hover:bg-amber-100 dark:text-amber-300 dark:hover:text-amber-200"
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBookmark(bookmark.original_ticket_id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <BookmarkX className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                {/* Original Ticket Card - Exact replica */}
                <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <TicketBadges
                        ticket={ticket}
                        hasNewMessages={false}
                        messageCount={0}
                        isAssignedToCurrentAdmin={false}
                        isEscalated={false}
                        isClosed={isClosed}
                      />
                      
                      <TicketInfo ticket={ticket} isClosed={isClosed} />
                      
                      <TicketAttachments attachments={ticket.attachments} />
                      
                      <ResolutionNotesDisplay resolutionNotes={ticket.resolution_notes} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookmarksView;
