import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import UserDateRangeFilter from '@/components/user/UserDateRangeFilter';

interface TicketFiltersProps {
  filter: 'all' | 'open' | 'in-progress' | 'resolved' | 'closed';
  onFilterChange: (filter: 'all' | 'open' | 'in-progress' | 'resolved' | 'closed') => void;
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
  statusCounts: {
    all: number;
    open: number;
    'in-progress': number;
    resolved: number;
    closed: number;
  };
  // Date filter props
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onClearDateFilter: () => void;
}

const TicketFilters = ({ 
  filter, 
  onFilterChange, 
  searchTerm, 
  onSearchChange, 
  statusCounts,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearDateFilter
}: TicketFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search by ticket number, description, classification, category, or module..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Date Range Filter */}
      <UserDateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onClearFilter={onClearDateFilter}
      />
      
      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
      {(['all', 'open', 'in-progress', 'resolved', 'closed'] as const).map((status) => (
        <Button
          key={status}
          variant={filter === status ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(status)}
          className="capitalize"
        >
          {status === 'all' ? 'All' : status.replace('-', ' ')} ({statusCounts[status]})
        </Button>
      ))}
      </div>
    </div>
  );
};

export default TicketFilters;