import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface UserDateRangeFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onClearFilter: () => void;
}

const UserDateRangeFilter = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearFilter
}: UserDateRangeFilterProps) => {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const hasDateFilter = startDate || endDate;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Filter by Date Range</label>
        {hasDateFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilter}
            className="h-6 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Start Date */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Start Date</label>
          <Popover open={startOpen} onOpenChange={setStartOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-full justify-start text-left font-normal h-8 text-xs",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-1 h-3 w-3" />
                {startDate ? format(startDate, "MMM d, yyyy") : "Start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate || undefined}
                onSelect={(date) => {
                  onStartDateChange(date || null);
                  setStartOpen(false);
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">End Date</label>
          <Popover open={endOpen} onOpenChange={setEndOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline" 
                size="sm"
                className={cn(
                  "w-full justify-start text-left font-normal h-8 text-xs",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-1 h-3 w-3" />
                {endDate ? format(endDate, "MMM d, yyyy") : "End date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate || undefined}
                onSelect={(date) => {
                  onEndDateChange(date || null);
                  setEndOpen(false);
                }}
                initialFocus
                disabled={(date) => startDate ? date < startDate : false}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filter Display */}
      {hasDateFilter && (
        <div className="text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1">
          <span className="font-medium">Active:</span>{' '}
          {startDate && endDate
            ? `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`
            : startDate
            ? `From ${format(startDate, "MMM d, yyyy")}`
            : endDate
            ? `Until ${format(endDate, "MMM d, yyyy")}`
            : ''}
        </div>
      )}
    </div>
  );
};

export default UserDateRangeFilter;