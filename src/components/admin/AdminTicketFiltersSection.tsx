
import TicketFilters from '@/components/admin/TicketFilters';
import DepartmentFilter from '@/components/admin/DepartmentFilter';
import DateRangeFilter from '@/components/admin/DateRangeFilter';
import type { Department } from '@/types/admin';
import type { TicketFilterState } from '@/components/admin/TicketFilters';

interface AdminTicketFiltersSectionProps {
  filters: TicketFilterState;
  setFilters: (filters: TicketFilterState) => void;
  departments: Department[];
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
  ticketMessageCounts: Map<string, number>;
  currentAdminId: string;
  // Date filter props
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onClearDateFilter: () => void;
}

const AdminTicketFiltersSection = ({
  filters,
  setFilters,
  departments,
  selectedDepartment,
  setSelectedDepartment,
  ticketMessageCounts,
  currentAdminId,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearDateFilter
}: AdminTicketFiltersSectionProps) => {

  return (
    <div className="space-y-4">
      {/* New Flexible Ticket Filters */}
      <TicketFilters
        filters={filters}
        onFiltersChange={setFilters}
        currentAdminId={currentAdminId}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Department Filter */}
        <DepartmentFilter 
          departments={departments}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          ticketMessageCounts={ticketMessageCounts}
        />
        
        {/* Date Range Filter */}
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
          onClearFilter={onClearDateFilter}
        />
      </div>
    </div>
  );
};

export default AdminTicketFiltersSection;
