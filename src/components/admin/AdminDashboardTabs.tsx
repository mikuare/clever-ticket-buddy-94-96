
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminTicketFiltersSection from '@/components/admin/AdminTicketFiltersSection';
import TicketManagement from './TicketManagement';
import ConfigurationManagement from '@/components/admin/ConfigurationManagement';
import MaintenanceModeManager from '@/components/admin/MaintenanceModeManager';
import StatsCards from '@/components/admin/StatsCards';
import { useTicketFilters } from '@/hooks/useTicketFilters';
import type { Ticket, Department } from '@/types/admin';

interface AdminDashboardTabsProps {
  tickets: Ticket[];
  stats?: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    reopened: number;
  };
  departments: Department[];
  selectedDepartment: string;
  loading: boolean;
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onGoToPage: (page: number) => void;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
  departmentNotifications: any[];
  userNotifications: any[];
  ticketMessageCounts: Map<string, number>;
  resolvingTickets: Set<string>;
  canReferTicket: (ticketId: string) => boolean;
  canEscalateTicket: (ticket: Ticket) => boolean;
  profile: any;
  onDepartmentChange: (department: string) => void;
  onAssignTicket: (ticketId: string, ticketNumber: string) => void;
  onResolveTicket: (ticketId: string, ticketNumber: string, resolutionNote: string) => Promise<void>;
  onOpenTicketChat: (ticket: Ticket) => void;
  onCloseTicketChat: () => void;
  onTicketsUpdate: () => void;
  onEscalateTicket: (ticket: Ticket) => void;
  showAllTickets: boolean;
  onToggleShowAll: (showAll: boolean) => void;
  clearNotificationForTicket: (ticketId: string) => void;
  // Bookmark functionality
  isBookmarked?: (ticketId: string) => boolean;
  getBookmarkInfo?: (ticketId: string) => { bookmark_title: string; created_at: string } | undefined;
  onBookmark?: (ticketId: string, title: string) => Promise<boolean>;
  onRemoveBookmark?: (ticketId: string) => Promise<boolean>;
}

const AdminDashboardTabs = ({
  tickets,
  stats,
  departments,
  selectedDepartment,
  loading,
  hasMore,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  onGoToPage,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  departmentNotifications,
  userNotifications,
  ticketMessageCounts,
  resolvingTickets,
  canReferTicket,
  canEscalateTicket,
  profile,
  onDepartmentChange,
  onAssignTicket,
  onResolveTicket,
  onOpenTicketChat,
  onCloseTicketChat,
  onTicketsUpdate,
  onEscalateTicket,
  showAllTickets,
  onToggleShowAll,
  clearNotificationForTicket,
  isBookmarked,
  getBookmarkInfo,
  onBookmark,
  onRemoveBookmark
}: AdminDashboardTabsProps) => {
  const [activeTab, setActiveTab] = useState('tickets');
  
  // Pass currentAdminId to the ticket filters hook
  const { 
    filters, 
    setFilters, 
    departmentFilteredTickets,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    clearDateFilter
  } = useTicketFilters(tickets, selectedDepartment, profile?.id);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="tickets">
          Tickets ({stats?.total || tickets.length})
        </TabsTrigger>
        <TabsTrigger value="configuration">
          Configuration
        </TabsTrigger>
        <TabsTrigger value="maintenance">
          Maintenance
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="tickets" className="mt-4 space-y-4">
        {/* Stats Cards */}
        <StatsCards tickets={stats ? [] : tickets} stats={stats} />
        
        <AdminTicketFiltersSection
          filters={filters}
          setFilters={setFilters}
          departments={departments}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={onDepartmentChange}
          ticketMessageCounts={ticketMessageCounts}
          currentAdminId={profile?.id || ''}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClearDateFilter={clearDateFilter}
        />
        
        {/* Ticket Management */}
              <TicketManagement
                tickets={departmentFilteredTickets}
                selectedDepartment={selectedDepartment}
                totalCount={totalCount}
                hasMore={hasMore}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onGoToPage={onGoToPage}
              onFirstPage={onFirstPage}
              onPreviousPage={onPreviousPage}
              onNextPage={onNextPage}
              onLastPage={onLastPage}
                showAllTickets={showAllTickets}
                onToggleShowAll={onToggleShowAll}
                loading={loading}
                onAssignTicket={(ticketId) => {
                  const ticket = tickets.find(t => t.id === ticketId);
                  if (ticket) onAssignTicket(ticketId, ticket.ticket_number);
                }}
                onResolveTicket={onResolveTicket}
                onOpenChat={onOpenTicketChat}
                ticketMessageCounts={ticketMessageCounts}
                currentAdminId={profile?.id || ''}
                onTicketsUpdate={onTicketsUpdate}
                resolvingTickets={resolvingTickets}
                canReferTicket={canReferTicket}
                canEscalateTicket={canEscalateTicket}
                onEscalateTicket={onEscalateTicket}
                clearNotificationForTicket={clearNotificationForTicket}
                isBookmarked={isBookmarked}
                getBookmarkInfo={getBookmarkInfo}
                onBookmark={onBookmark}
                onRemoveBookmark={onRemoveBookmark}
              />
      </TabsContent>
      
      <TabsContent value="configuration" className="mt-4">
        <ConfigurationManagement />
      </TabsContent>
      
      <TabsContent value="maintenance" className="mt-4">
        <MaintenanceModeManager />
      </TabsContent>
    </Tabs>
  );
};

export default AdminDashboardTabs;
