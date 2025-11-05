import { useState } from 'react';
import MobileAdminHeader from './MobileAdminHeader';
import MobileAdminBottomNav, { type MobileAdminTab } from './MobileAdminBottomNav';
import MobileAdminStatsCards from './MobileAdminStatsCards';
import MobileAdminTicketCard from './MobileAdminTicketCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Filter, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Ticket } from '@/types/admin';
import PostsSection from '@/components/posts/PostsSection';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MobileAdminDashboardProps {
  tickets: Ticket[];
  stats: {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
  profileName: string;
  departmentCode?: string;
  onSignOut: () => void;
  onViewUsers?: () => void;
  onViewDepartmentUsers?: () => void;
  onViewDepartmentImages?: () => void;
  onViewAdminAnalysis?: () => void;
  onViewTicketAnalysis?: () => void;
  onViewBookmarks?: () => void;
  onDepartmentLogoClick?: () => void;
  onClearNotifications?: () => void;
  hasNotifications?: boolean;
  totalNotifications?: number;
  ticketMessageCounts?: Map<string, number>;
  departmentNotifications?: any[];
  onOpenTicketChat: (ticket: Ticket) => void;
  onAssignTicket: (ticketId: string) => void;
  onResolveTicket: (ticketId: string, ticketNumber: string, resolutionNote: string) => void;
  onEscalateTicket?: (ticket: Ticket) => void;
  isBookmarked?: (ticketId: string) => boolean;
  onBookmark?: (ticketId: string, ticketNumber: string) => void;
  onRemoveBookmark?: (ticketId: string) => void;
  onOpenTeamManager?: () => void;
  onOpenITTeam?: () => void;
  onOpenBranding?: () => void;
  onOpenLogo?: () => void;
}

const MobileAdminDashboard = ({
  tickets,
  stats,
  profileName,
  departmentCode,
  onSignOut,
  onViewUsers,
  onViewDepartmentUsers,
  onViewDepartmentImages,
  onViewAdminAnalysis,
  onViewTicketAnalysis,
  onViewBookmarks,
  onDepartmentLogoClick,
  onClearNotifications,
  hasNotifications,
  totalNotifications = 0,
  ticketMessageCounts = new Map(),
  departmentNotifications = [],
  onOpenTicketChat,
  onAssignTicket,
  onResolveTicket,
  onEscalateTicket,
  isBookmarked,
  onBookmark,
  onRemoveBookmark,
  onOpenTeamManager,
  onOpenITTeam,
  onOpenBranding,
  onOpenLogo
}: MobileAdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<MobileAdminTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Filter and sort tickets
  const filteredTickets = tickets
    .filter((ticket) => {
      const matchesSearch =
        searchQuery === '' ||
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.user_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === 'all' || ticket.status.toLowerCase() === filterStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'priority':
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return (
            priorityOrder[a.priority.toLowerCase() as keyof typeof priorityOrder] -
            priorityOrder[b.priority.toLowerCase() as keyof typeof priorityOrder]
          );
        default:
          return 0;
      }
    });

  const handleBookmarkToggle = (ticket: Ticket) => {
    if (isBookmarked && isBookmarked(ticket.id)) {
      onRemoveBookmark?.(ticket.id);
    } else {
      onBookmark?.(ticket.id, ticket.ticket_number);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <MobileAdminHeader
        profileName={profileName}
        departmentCode={departmentCode}
        onSignOut={onSignOut}
        onViewUsers={onViewUsers}
        onViewDepartmentUsers={onViewDepartmentUsers}
        onViewDepartmentImages={onViewDepartmentImages}
        onViewAdminAnalysis={onViewAdminAnalysis}
        onViewTicketAnalysis={onViewTicketAnalysis}
        onViewBookmarks={onViewBookmarks}
        onDepartmentLogoClick={onDepartmentLogoClick}
        onClearNotifications={onClearNotifications}
        hasNotifications={hasNotifications}
        totalNotifications={totalNotifications}
        onOpenTeamManager={onOpenTeamManager}
        onOpenITTeam={onOpenITTeam}
        onOpenBranding={onOpenBranding}
        onOpenLogo={onOpenLogo}
      />

      {/* Main Content */}
      <ScrollArea className="h-[calc(100vh-56px-64px)]">
        <div className="p-4 space-y-4">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              {/* Posts Section */}
              <PostsSection />

              {/* Stats Cards */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  Ticket Overview
                </h2>
                <MobileAdminStatsCards stats={stats} />
              </div>

              {/* Recent Tickets */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    Recent Tickets
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('tickets')}
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {tickets.slice(0, 5).map((ticket) => (
                    <MobileAdminTicketCard
                      key={ticket.id}
                      ticket={ticket}
                      hasNewMessage={ticketMessageCounts.has(ticket.id)}
                      isBookmarked={isBookmarked?.(ticket.id)}
                      onOpenChat={() => onOpenTicketChat(ticket)}
                      onAssign={() => onAssignTicket(ticket.id)}
                      onResolve={() => onResolveTicket(ticket.id, ticket.ticket_number, '')}
                      onEscalate={() => onEscalateTicket?.(ticket)}
                      onBookmark={() => handleBookmarkToggle(ticket)}
                    />
                  ))}
                  {tickets.length === 0 && (
                    <Card className="p-8 text-center">
                      <p className="text-sm text-muted-foreground">No tickets found</p>
                    </Card>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <>
              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="flex-1">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="flex-1">
                      <SortAsc className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Showing {filteredTickets.length} tickets</span>
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="h-6 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Ticket List */}
              <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <MobileAdminTicketCard
                    key={ticket.id}
                    ticket={ticket}
                    hasNewMessage={ticketMessageCounts.has(ticket.id)}
                    isBookmarked={isBookmarked?.(ticket.id)}
                    onOpenChat={() => onOpenTicketChat(ticket)}
                    onAssign={() => onAssignTicket(ticket.id)}
                    onResolve={() => onResolveTicket(ticket.id, ticket.ticket_number, '')}
                    onEscalate={() => onEscalateTicket?.(ticket)}
                    onBookmark={() => handleBookmarkToggle(ticket)}
                  />
                ))}
                {filteredTickets.length === 0 && (
                  <Card className="p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? `No tickets found matching "${searchQuery}"`
                        : 'No tickets found'}
                    </p>
                  </Card>
                )}
              </div>
            </>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
              {departmentNotifications.map((dept, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{dept.departmentName}</h3>
                    <Badge variant="secondary">{dept.openTickets.length}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dept.openTickets.length} open ticket{dept.openTickets.length !== 1 ? 's' : ''}
                  </p>
                </Card>
              ))}
              {departmentNotifications.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </Card>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Quick Analytics</h2>
              <MobileAdminStatsCards stats={stats} />
              
              <Card className="p-4">
                <h3 className="font-semibold text-sm mb-3">Performance Metrics</h3>
                <div className="space-y-2">
                  <MetricRow label="Total Tickets" value={stats.open + stats.inProgress + stats.resolved + stats.closed} />
                  <MetricRow label="Active Tickets" value={stats.open + stats.inProgress} />
                  <MetricRow label="Completion Rate" value={`${Math.round((stats.closed / (stats.open + stats.inProgress + stats.resolved + stats.closed)) * 100)}%`} />
                </div>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onViewAdminAnalysis}>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Full Analysis
                </Button>
                <Button variant="outline" className="flex-1" onClick={onViewTicketAnalysis}>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                  Ticket Stats
                </Button>
              </div>
            </div>
          )}

          {/* More Tab */}
          {activeTab === 'more' && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground mb-3">More Options</h2>
              
              <Card className="p-3">
                <h3 className="font-semibold text-sm mb-2">Management</h3>
                <div className="space-y-1">
                  <QuickButton label="User Presence" onClick={onViewUsers} />
                  <QuickButton label="Department Users" onClick={onViewDepartmentUsers} />
                  <QuickButton label="Department Images" onClick={onViewDepartmentImages} />
                  <QuickButton label="My Bookmarks" onClick={onViewBookmarks} />
                </div>
              </Card>

              <Card className="p-3">
                <h3 className="font-semibold text-sm mb-2">Team Settings</h3>
                <div className="space-y-1">
                  <QuickButton label="Digitalization Team" onClick={onOpenTeamManager} />
                  <QuickButton label="IT Team" onClick={onOpenITTeam} />
                  <QuickButton label="Branding" onClick={onOpenBranding} />
                  <QuickButton label="Logo Manager" onClick={onOpenLogo} />
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom Navigation */}
      <MobileAdminBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notificationCount={totalNotifications}
        ticketCount={stats.open + stats.inProgress}
      />
    </div>
  );
};

const MetricRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold text-foreground">{value}</span>
  </div>
);

const QuickButton = ({ label, onClick }: { label: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors active:scale-[0.98]"
  >
    {label}
  </button>
);

export default MobileAdminDashboard;

