import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

interface TicketPaginationProps {
  pageItemCount: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  hasMore: boolean;
  loading: boolean;
  onGoToPage: (page: number) => void;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
  showAllTickets: boolean;
  onToggleShowAll: (showAll: boolean) => void;
}

const TicketPagination = ({
  pageItemCount,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  hasMore,
  loading,
  onGoToPage,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  showAllTickets,
  onToggleShowAll
}: TicketPaginationProps) => {
  const safeTotalPages = Math.max(totalPages, 1);
  const isFirstPage = currentPage <= 0;
  const isLastPage = currentPage >= safeTotalPages - 1;
  const disableNavigation = loading || showAllTickets || safeTotalPages <= 1;

  const startIndex = totalCount === 0 ? 0 : currentPage * pageSize + 1;
  const endIndex = totalCount === 0 ? 0 : startIndex + pageItemCount - 1;

  const [pageInput, setPageInput] = useState<string>(() => (currentPage + 1).toString());

  useEffect(() => {
    setPageInput((currentPage + 1).toString());
  }, [currentPage]);

  const handleToggleShowAll = (checked: boolean) => {
    if (loading) return;
    onToggleShowAll(checked);
  };

  const handlePageSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disableNavigation) return;

    const parsed = Number(pageInput.trim());
    if (Number.isNaN(parsed)) {
      setPageInput((currentPage + 1).toString());
      return;
    }

    const clamped = Math.min(Math.max(parsed, 1), safeTotalPages);
    setPageInput(clamped.toString());
    onGoToPage(clamped - 1);
  };

  return (
    <div className={`bg-muted/30 border rounded-lg p-4 mb-4 transition-all duration-300 ${loading ? 'bg-blue-50/50 border-blue-200' : ''}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="text-sm font-medium text-foreground">
            {totalCount === 0
              ? 'No tickets available'
              : `Showing ${startIndex.toLocaleString()}-${endIndex.toLocaleString()} of ${totalCount.toLocaleString()} tickets`}
          </div>
          <div className="text-xs text-muted-foreground">
            {totalCount === 0 ? 'Page 0 of 0 pages' : `Page ${currentPage + 1} of ${safeTotalPages} pages`}
          </div>
          {!showAllTickets && !hasMore && !loading && totalCount > 0 && (
            <div className="text-xs text-green-600 font-medium flex items-center gap-1.5">
              <span className="text-base">✓</span>
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
              <span className="animate-pulse">Refreshing tickets...</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className={`flex items-center gap-2 bg-background px-3 py-2 rounded-md border transition-opacity duration-300 ${loading ? 'opacity-50' : ''}`}>
            <Switch
              id="show-all-tickets"
              checked={showAllTickets}
              onCheckedChange={handleToggleShowAll}
              disabled={loading}
            />
            <Label htmlFor="show-all-tickets" className="text-sm font-medium cursor-pointer">
              Show all tickets
            </Label>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onFirstPage}
              disabled={disableNavigation || isFirstPage}
              title="Go to first page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousPage}
              disabled={disableNavigation || isFirstPage}
              title="Go to previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <form onSubmit={handlePageSubmit} className="flex items-center gap-2">
              <Input
                value={pageInput}
                onChange={(event) => setPageInput(event.target.value.replace(/[^0-9]/g, ''))}
                disabled={disableNavigation}
                inputMode="numeric"
                pattern="[0-9]*"
                className="h-8 w-16 text-center text-sm"
                aria-label="Jump to page"
              />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={disableNavigation}
              >
                Go
              </Button>
            </form>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={disableNavigation || isLastPage}
              title="Go to next page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLastPage}
              disabled={disableNavigation || isLastPage}
              title="Go to last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPagination;