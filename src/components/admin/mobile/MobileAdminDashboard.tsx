import { useState } from 'react';
import MobileAdminHeader from './MobileAdminHeader';
import MobileAdminBottomNav, { type MobileAdminTab } from './MobileAdminBottomNav';
import MobileAdminStatsCards from './MobileAdminStatsCards';
import MobileAdminTicketCard from './MobileAdminTicketCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Filter, SortAsc, RefreshCw, List, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Ticket } from '@/types/admin';
import type { ReferralNotification } from '@/types/referral';
import PostsSection from '@/components/posts/PostsSection';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ResolutionNoteDialog from '../ticket-management/ResolutionNoteDialog';
import TicketReferralModal from '../TicketReferralModal';
import TicketProgressionModal from '@/components/TicketProgressionModal';
import { useReferralNotifications } from '@/hooks/useReferralNotifications';
import { useReferralActions } from '@/hooks/useReferralActions';
import EscalatedTicketsContent from '@/components/admin/escalation/EscalatedTicketsContent';
import { useEscalatedTickets } from '@/components/admin/escalation/hooks/useEscalatedTickets';

interface MobileAdminDashboardProps {
  tickets: Ticket[];
  stats: {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    reopened?: number;
    total?: number;
  };
  profileName: string;
  profileAvatarUrl?: string;
  departmentCode?: string;
  currentAdminId?: string;
  resolvingTickets?: Set<string>;
  canReferTicket?: (ticketId: string) => boolean;
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
  escalationCount?: number;
  ticketMessageCounts?: Map<string, number>;
  departmentNotifications?: any[];
  onOpenTicketChat: (ticket: Ticket) => void;
  onAssignTicket: (ticketId: string) => void;
  onResolveTicket: (ticketId: string, ticketNumber: string, resolutionNote: string) => void;
  onReferTicket?: (ticket: Ticket) => void;
  onEscalateTicket?: (ticket: Ticket) => void;
  isBookmarked?: (ticketId: string) => boolean;
  onBookmark?: (ticketId: string, ticketNumber: string) => void;
  onRemoveBookmark?: (ticketId: string) => void;
  onOpenTeamManager?: () => void;
  onOpenITTeam?: () => void;
  onOpenBranding?: () => void;
  onOpenLogo?: () => void;
  onRefreshTickets?: () => void;
  onShowAllTickets?: () => void;
}

const MobileAdminDashboard = ({
  tickets,
  stats,
  profileName,
  profileAvatarUrl,
  departmentCode,
  currentAdminId,
  resolvingTickets = new Set(),
  canReferTicket,
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
  onReferTicket,
  onEscalateTicket,
  isBookmarked,
  onBookmark,
  onRemoveBookmark,
  onOpenTeamManager,
  onOpenITTeam,
  onOpenBranding,
  onOpenLogo,
  onRefreshTickets,
  onShowAllTickets,
  escalationCount = 0
}: MobileAdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<MobileAdminTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [resolutionDialogOpen, setResolutionDialogOpen] = useState(false);
  const [selectedTicketForResolution, setSelectedTicketForResolution] = useState<Ticket | null>(null);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [selectedTicketForReferral, setSelectedTicketForReferral] = useState<Ticket | null>(null);
  const [selectedTicketForProgression, setSelectedTicketForProgression] = useState<Ticket | null>(null);
  const [processingReferralId, setProcessingReferralId] = useState<string | null>(null);

  const {
    notifications: referralNotifications,
    loading: referralLoading,
    fetchReferralNotifications
  } = useReferralNotifications({ adminId: currentAdminId || '' });

  const safeRefreshTickets = onRefreshTickets ?? (() => {});

  const { loading: referralActionLoading, handleReferralAction } = useReferralActions({
    adminId: currentAdminId || '',
    onNotificationUpdate: safeRefreshTickets,
    onRefreshNotifications: fetchReferralNotifications
  });

  const escalationsOpen = activeTab === 'escalations';
  const {
    escalatedTickets,
    loading: escalationsLoading,
    resolvingTickets: resolvingEscalations,
    handleResolveEscalation
  } = useEscalatedTickets(escalationsOpen, safeRefreshTickets);

  const stripHtmlTags = (value?: string | null) =>
    value ? value.replace(/<[^>]+>/g, ' ') : '';

  const parseAttachments = (attachments: any) => {
    if (!attachments) return null;
    if (typeof attachments === 'string') {
      try {
        return JSON.parse(attachments);
      } catch {
        return attachments;
      }
    }
    return attachments;
  };

  const attachmentsIncludeTerm = (attachments: any, term: string) => {
    if (!attachments || !term) return false;
    try {
      const parsed = parseAttachments(attachments);
      const serialized = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
      return serialized.toLowerCase().includes(term);
    } catch (error) {
      console.error('Error searching attachments', error);
      return false;
    }
  };

  const ticketMatchesSearch = (ticket: Ticket, term: string) => {
    if (!term) return true;

    const checkField = (value: any) =>
      typeof value === 'string' && value.toLowerCase().includes(term);

    if (checkField(ticket.ticket_number)) return true;
    if (checkField(ticket.title)) return true;
    if (checkField(stripHtmlTags(ticket.description))) return true;

    const userName = (ticket as any)?.user_name;
    if (checkField(userName)) return true;

    const departmentName = (ticket as any)?.department_name;
    if (checkField(departmentName)) return true;

    if (checkField(ticket.department_code)) return true;
    if (checkField(ticket.assigned_admin_name)) return true;
    if (checkField(ticket.status)) return true;
    if (checkField(ticket.profiles?.full_name)) return true;

    if (attachmentsIncludeTerm(ticket.attachments, term)) return true;

    return false;
  };

  const searchTerm = searchQuery.trim().toLowerCase();
  const totalTickets = stats.total ?? (stats.open + stats.inProgress + stats.resolved + stats.closed);

  const normalizeStatus = (status: string | undefined | null) =>
    (status ?? '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/_+/g, '-');

  const handleReferralDecision = async (
    referral: ReferralNotification,
    action: 'accepted' | 'declined'
  ) => {
    if (!currentAdminId) return;
    try {
      setProcessingReferralId(referral.id);
      await handleReferralAction(referral.id, action, referral);
    } finally {
      setProcessingReferralId(null);
    }
  };

  const getReferralStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'accepted':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'declined':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const pendingReferrals = referralNotifications.filter(ref => ref.status === 'pending');
  const otherReferrals = referralNotifications.filter(ref => ref.status !== 'pending');
  const alertsBadge = totalNotifications + pendingReferrals.length;
  const escalationsBadge = escalationsOpen ? escalatedTickets.length : escalationCount;

  // Filter and sort tickets (removed priority sorting as user doesn't use it)
  const filteredTickets = tickets
    .filter((ticket) => {
      const matchesSearch = searchTerm === '' || ticketMatchesSearch(ticket, searchTerm);

      const matchesStatus =
        filterStatus === 'all' || normalizeStatus(ticket.status) === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
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

  const handleResolveClick = (ticket: Ticket) => {
    setSelectedTicketForResolution(ticket);
    setResolutionDialogOpen(true);
  };

  const handleResolutionSubmit = async (resolutionNote: string) => {
    if (selectedTicketForResolution) {
      await onResolveTicket(
        selectedTicketForResolution.id,
        selectedTicketForResolution.ticket_number,
        resolutionNote
      );
      setResolutionDialogOpen(false);
      setSelectedTicketForResolution(null);
    }
  };

  const handleReferClick = (ticket: Ticket) => {
    setSelectedTicketForReferral(ticket);
    setReferralModalOpen(true);
  };

  const handleReferralSent = () => {
    setReferralModalOpen(false);
    setSelectedTicketForReferral(null);
    onRefreshTickets?.();
  };

  const handleShowProgression = (ticket: Ticket) => {
    setSelectedTicketForProgression(ticket);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <MobileAdminHeader
        profileName={profileName}
        departmentCode={departmentCode}
        profileAvatarUrl={profileAvatarUrl}
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
        totalNotifications={alertsBadge}
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
                      currentAdminId={currentAdminId}
                      canRefer={canReferTicket?.(ticket.id)}
                      onOpenChat={() => onOpenTicketChat(ticket)}
                      onAssign={() => onAssignTicket(ticket.id)}
                      onResolve={() => handleResolveClick(ticket)}
                      onReferTicket={() => handleReferClick(ticket)}
                  onShowProgression={() => handleShowProgression(ticket)}
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
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Showing {filteredTickets.length} tickets</span>
                  <div className="flex items-center gap-2">
                    {onShowAllTickets && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onShowAllTickets}
                        className="h-7 text-xs"
                      >
                        <List className="w-3 h-3 mr-1" />
                        Show All
                      </Button>
                    )}
                    {onRefreshTickets && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRefreshTickets}
                        className="h-7 w-7 p-0"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    )}
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchQuery('')}
                        className="h-7 text-xs"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
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
                    currentAdminId={currentAdminId}
                    canRefer={canReferTicket?.(ticket.id)}
                    onOpenChat={() => onOpenTicketChat(ticket)}
                    onAssign={() => onAssignTicket(ticket.id)}
                    onResolve={() => handleResolveClick(ticket)}
                    onReferTicket={() => handleReferClick(ticket)}
                    onShowProgression={() => handleShowProgression(ticket)}
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

              {currentAdminId && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Ticket Referrals</h3>
                    {referralLoading && (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                  </div>

                  {!referralLoading && referralNotifications.length === 0 && (
                    <Card className="p-4">
                      <p className="text-xs text-muted-foreground">
                        No referral alerts at the moment.
                      </p>
                    </Card>
                  )}

                  {pendingReferrals.map((referral) => {
                    const isProcessing = processingReferralId === referral.id && referralActionLoading;
                    return (
                      <Card key={referral.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {referral.ticket?.ticket_number || 'Ticket'}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {referral.ticket?.title}
                            </p>
                          </div>
                          <Badge className={getReferralStatusBadgeClass(referral.status)}>
                            Pending
                          </Badge>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Referred by {referral.referring_admin?.full_name || 'Another admin'} •{' '}
                          {formatDistanceToNow(new Date(referral.created_at), { addSuffix: true })}
                        </div>

                        {referral.message && (
                          <div className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-md">
                            {referral.message}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            disabled={isProcessing}
                            onClick={() => handleReferralDecision(referral, 'accepted')}
                          >
                            {isProcessing ? 'Processing...' : 'Accept'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            disabled={isProcessing}
                            onClick={() => handleReferralDecision(referral, 'declined')}
                          >
                            Decline
                          </Button>
                        </div>
                      </Card>
                    );
                  })}

                  {otherReferrals.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Recent Referral Activity
                      </h4>
                      {otherReferrals.map((referral) => (
                        <Card key={referral.id} className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {referral.ticket?.ticket_number || 'Ticket'}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {referral.ticket?.title}
                              </p>
                            </div>
                            <Badge className={getReferralStatusBadgeClass(referral.status)}>
                              {referral.status === 'accepted' ? 'Accepted' : 'Declined'}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Referred by {referral.referring_admin?.full_name || 'Another admin'} •{' '}
                            {formatDistanceToNow(new Date(referral.created_at), { addSuffix: true })}
                          </div>
                          {referral.status !== 'pending' && referral.responded_at && (
                            <div className="text-[11px] text-muted-foreground">
                              {referral.status === 'accepted' ? 'Accepted' : 'Declined'}{' '}
                              {formatDistanceToNow(new Date(referral.responded_at), { addSuffix: true })}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Escalations Tab */}
          {activeTab === 'escalations' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Escalated Tickets</h2>
                <Badge variant="secondary" className="text-xs">
                  {escalatedTickets.length}
                </Badge>
              </div>
              <Card className="p-4">
                <EscalatedTicketsContent
                  loading={escalationsLoading}
                  escalatedTickets={escalatedTickets}
                  resolvingTickets={resolvingEscalations}
                  userId={currentAdminId}
                  onResolve={(escalationId, ticketNumber, resolutionNote) =>
                    handleResolveEscalation(escalationId, ticketNumber, resolutionNote)
                  }
                />
              </Card>
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
                  <MetricRow label="Total Tickets" value={totalTickets} />
                  <MetricRow label="Active Tickets" value={stats.open + stats.inProgress} />
                  <MetricRow label="Reopened Tickets" value={stats.reopened ?? 0} />
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
        alertsCount={alertsBadge}
        ticketCount={stats.open + stats.inProgress}
        escalationCount={escalationsBadge}
      />

      {/* Resolution Note Dialog */}
      {selectedTicketForResolution && (
        <ResolutionNoteDialog
          isOpen={resolutionDialogOpen}
          onClose={() => {
            setResolutionDialogOpen(false);
            setSelectedTicketForResolution(null);
          }}
          onSubmit={handleResolutionSubmit}
          ticketNumber={selectedTicketForResolution.ticket_number}
          isResolving={resolvingTickets.has(selectedTicketForResolution.id)}
        />
      )}

      {/* Ticket Referral Modal */}
      {selectedTicketForReferral && currentAdminId && (
        <TicketReferralModal
          ticket={selectedTicketForReferral}
          isOpen={referralModalOpen}
          onClose={() => {
            setReferralModalOpen(false);
            setSelectedTicketForReferral(null);
          }}
          currentAdminId={currentAdminId}
          onReferralSent={handleReferralSent}
        />
      )}

      {/* Ticket Progression Modal */}
      {selectedTicketForProgression && (
        <TicketProgressionModal
          ticket={selectedTicketForProgression}
          isOpen={!!selectedTicketForProgression}
          onClose={() => setSelectedTicketForProgression(null)}
        />
      )}
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

