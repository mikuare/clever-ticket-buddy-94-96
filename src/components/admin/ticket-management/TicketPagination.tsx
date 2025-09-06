import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface TicketPaginationProps {
  currentCount: number;
  totalCount: number;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  showAllTickets: boolean;
  onToggleShowAll: (showAll: boolean) => void;
}

const TicketPagination = ({ 
  currentCount, 
  totalCount, 
  hasMore, 
  loading, 
  onLoadMore,
  showAllTickets,
  onToggleShowAll
}: TicketPaginationProps) => {
  if (!hasMore && currentCount >= totalCount) {
    return (
      <div className="flex justify-center py-4 text-sm text-muted-foreground">
        All tickets loaded ({totalCount} total)
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {currentCount} of {totalCount} tickets
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="show-all-tickets"
            checked={showAllTickets}
            onCheckedChange={onToggleShowAll}
            disabled={loading}
          />
          <Label htmlFor="show-all-tickets" className="text-sm">
            Show all tickets
          </Label>
        </div>
      </div>
      {!showAllTickets && hasMore && (
        <Button 
          variant="outline" 
          onClick={onLoadMore}
          disabled={loading}
          className="w-32"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading...
            </>
          ) : (
            'Load More'
          )}
        </Button>
      )}
    </div>
  );
};

export default TicketPagination;