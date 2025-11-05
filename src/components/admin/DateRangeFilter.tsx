import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DateRangeFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onClearFilter: () => void;
}

const DateRangeFilter = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearFilter
}: DateRangeFilterProps) => {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const hasDateFilter = startDate || endDate;

  return (
    <Card className="border-muted">
      <CardHeader className="pb-1 pt-2">
        <CardTitle className="text-[11px] font-medium flex items-center justify-between">
          Filter by Date Range
          {hasDateFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilter}
              className="h-5 px-1.5 text-[10px]"
            >
              <X className="w-2.5 h-2.5 mr-0.5" />
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-1.5 pb-2">
        <div className="grid grid-cols-2 gap-1.5">
          {/* Start Date */}
          <div className="space-y-0.5">
            <label className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">
              Start Date
            </label>
            <Popover open={startOpen} onOpenChange={setStartOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal h-7 text-[11px] px-2",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1 h-2.5 w-2.5" />
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
                  disabled={(date) => endDate ? date > endDate : false}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="space-y-0.5">
            <label className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">
              End Date
            </label>
            <Popover open={endOpen} onOpenChange={setEndOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline" 
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal h-7 text-[11px] px-2",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1 h-2.5 w-2.5" />
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
          <div className="text-[9px] text-muted-foreground bg-muted/30 rounded px-1.5 py-0.5">
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
      </CardContent>
    </Card>
  );
};

export default DateRangeFilter;