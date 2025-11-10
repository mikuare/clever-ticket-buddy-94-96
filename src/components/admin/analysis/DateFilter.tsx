
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { useIsMobile } from '@/hooks/use-mobile';

interface DateFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onClearFilter: () => void;
}

const DateFilter = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearFilter
}: DateFilterProps) => {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const isMobile = useIsMobile();

  const hasActiveFilter = startDate || endDate;

  return (
    <AnimatedContainer variant="card" className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 text-blue-700 font-medium">
          <CalendarIcon className="w-4 h-4" />
          <span>Filter by Date Range</span>
        </div>
        
        <div className={`flex flex-wrap items-center gap-3 ${isMobile ? 'w-full' : ''}`}>
          {/* Start Date Picker */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-blue-600 font-medium">From</span>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    `${isMobile ? 'w-full' : 'w-[140px]'} justify-start text-left font-normal border-blue-300`,
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "MMM d, yyyy") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate || undefined}
                  onSelect={(date) => {
                    onStartDateChange(date || null);
                    setStartDateOpen(false);
                  }}
                  disabled={(date) => {
                    const today = new Date();
                    return date > today || (endDate && date > endDate);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date Picker */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-blue-600 font-medium">To</span>
            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    `${isMobile ? 'w-full' : 'w-[140px]'} justify-start text-left font-normal border-blue-300`,
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "MMM d, yyyy") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate || undefined}
                  onSelect={(date) => {
                    onEndDateChange(date || null);
                    setEndDateOpen(false);
                  }}
                  disabled={(date) => {
                    const today = new Date();
                    return date > today || (startDate && date < startDate);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Clear Filter Button */}
          {hasActiveFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilter}
              className={`text-blue-600 hover:text-blue-800 hover:bg-blue-100 ${isMobile ? 'w-full' : ''}`}
            >
              <X className="w-4 h-4 mr-1" />
              Clear Filter
            </Button>
          )}
        </div>

        {hasActiveFilter && (
          <div className={`text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full ${isMobile ? 'w-full text-center' : ''}`}>
            {startDate && endDate ? (
              <>Showing data from {format(startDate, "MMM d, yyyy")} to {format(endDate, "MMM d, yyyy")}</>
            ) : startDate ? (
              <>Showing data from {format(startDate, "MMM d, yyyy")} onwards</>
            ) : endDate ? (
              <>Showing data up to {format(endDate, "MMM d, yyyy")}</>
            ) : null}
          </div>
        )}
      </div>
    </AnimatedContainer>
  );
};

export default DateFilter;
