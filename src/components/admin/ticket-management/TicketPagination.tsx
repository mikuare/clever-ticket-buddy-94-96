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
  return (
    <div className={`bg-muted/30 border rounded-lg p-4 mb-4 transition-all duration-300 ${loading ? 'bg-blue-50/50 border-blue-200' : ''}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-gray-700">
            Showing {currentCount} of {totalCount} tickets
          </div>
          {!hasMore && currentCount >= totalCount && !loading && (
            <div className="text-sm text-green-600 font-medium flex items-center gap-1.5">
              <span className="text-lg">✓</span>
              <span>All tickets loaded</span>
            </div>
          )}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium animate-in fade-in duration-300">
              <div className="relative">
                <Loader2 className="h-4 w-4 animate-spin" />
                <div className="absolute inset-0 h-4 w-4 animate-ping opacity-20">
                  <Loader2 className="h-4 w-4" />
                </div>
              </div>
              <span className="animate-pulse">Fetching more tickets...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 bg-background px-3 py-2 rounded-md border transition-opacity duration-300 ${loading ? 'opacity-50' : ''}`}>
            <Switch
              id="show-all-tickets"
              checked={showAllTickets}
              onCheckedChange={onToggleShowAll}
              disabled={loading}
            />
            <Label htmlFor="show-all-tickets" className="text-sm font-medium cursor-pointer">
              Show all tickets
            </Label>
          </div>
          
          {!showAllTickets && hasMore && (
            <Button 
              variant="default" 
              onClick={onLoadMore}
              disabled={loading}
              className={`min-w-[140px] relative transition-all duration-300 ${loading ? 'bg-blue-600 hover:bg-blue-600' : ''}`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <div className="absolute inset-0 animate-ping opacity-30">
                      <div className="h-5 w-5 rounded-full bg-white"></div>
                    </div>
                  </div>
                  <span className="animate-pulse font-medium">Loading tickets...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2 font-medium">
                  <span>Load More</span>
                  <span className="text-xs opacity-70">↓</span>
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketPagination;