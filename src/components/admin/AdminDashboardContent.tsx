
import { useState } from 'react';
import DashboardHeader from './DashboardHeader';
import AdminDashboardTabs from './AdminDashboardTabs';
import AdminDashboardViewSection from './sections/AdminDashboardViewSection';
import NotificationsPanel from './dashboard/NotificationsPanel';
import FloatingActions from './dashboard/FloatingActions';
import DashboardModals from './dashboard/DashboardModals';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import LoadingSpinner from './LoadingSpinner';
import DigitalizationTeamManager from './DigitalizationTeamManager';
import ITTeamManager from './ITTeamManager';
import BrandingManager from './BrandingManager';
import LogoManager from './LogoManager';
import { Button } from '@/components/ui/button';
import { Users, Monitor, Image, Crown } from 'lucide-react';
import FloatingTeamManagement from './FloatingTeamManagement';
import PostsSection from '@/components/posts/PostsSection';
import MobileAdminDashboard from './mobile/MobileAdminDashboard';
import { useIsMobile } from '@/hooks/use-mobile';
import TicketChat from './TicketChat';

const AdminDashboardContent = () => {
  const isMobile = useIsMobile();
  const [showTeamManager, setShowTeamManager] = useState(false);
  const [showITTeamManager, setShowITTeamManager] = useState(false);
  const [showBrandingManager, setShowBrandingManager] = useState(false);
  const [showLogoManager, setShowLogoManager] = useState(false);
  const {
    tickets,
    stats,
    departments,
    selectedDepartment,
    selectedTicket,
    loading,
    hasMore,
    totalCount,
    totalPages,
    pageSize,
    currentPage,
    goToPage,
    goToFirstPage,
    goToPreviousPage,
    goToNextPage,
    goToLastPage,
    departmentNotifications,
    userNotifications,
    ticketMessageCounts,
    clearAllNotifications,
    totalBrowserNotifications,
    escalationCount,
    resolvingTickets,
    canReferTicket,
    canEscalateTicket,
    selectedTicketForEscalation,
    showEscalatedTickets,
    showUserPresence,
    showDepartmentUsers,
    showDepartmentImages,
    showAdminAnalysis,
    showTicketAnalysis,
    isAdmin,
    isVerifyingAdmin,
    profile,
    signOut,
    setSelectedDepartment,
    handleAssignTicket,
    handleResolveTicket,
    handleOpenTicketChat,
    handleCloseTicketChat,
    fetchTickets,
    loadAllTickets,
    showAllTickets,
    setShowAllTickets,
    clearNotificationForTicket,
    handleOpenEscalationModal,
    handleCloseEscalationModal,
    handleEscalationSuccess,
    handleOpenEscalatedTickets,
    handleCloseEscalatedTickets,
    handleTicketResolved,
    showBookmarks,
    handleViewUsers,
    handleViewDepartmentUsers,
    handleViewDepartmentImages,
    handleViewAdminAnalysis,
    handleViewTicketAnalysis,
    handleViewBookmarks,
    closeAllViews,
    referralCount,
    
    // Bookmark functionality
    isBookmarked,
    getBookmarkInfo,
    addBookmark,
    removeBookmark
  } = useAdminDashboard();

  const [showNotifications, setShowNotifications] = useState(false);

  // Show loading spinner if still verifying admin status
  if (isVerifyingAdmin) {
    return <LoadingSpinner />;
  }

  // Total notification count for badge - count unique open tickets to avoid duplication
  const totalNotifications = departmentNotifications.reduce((total, dept) => total + dept.openTickets.length, 0);

  // Check if any view is currently active
  const isAnyViewActive = showUserPresence || showDepartmentUsers || showDepartmentImages || showAdminAnalysis || showTicketAnalysis || showBookmarks;

  // Mobile UI - Render dedicated mobile interface
  if (isMobile) {
    return (
      <>
        <MobileAdminDashboard
          tickets={tickets}
          stats={stats}
          profileName={profile?.full_name || 'Admin'}
          profileAvatarUrl={profile?.avatar_url || undefined}
          departmentCode={profile?.department_code}
          currentAdminId={profile?.id}
          resolvingTickets={resolvingTickets}
          canReferTicket={canReferTicket}
          onSignOut={signOut}
          onViewUsers={handleViewUsers}
          onViewDepartmentUsers={handleViewDepartmentUsers}
          onViewDepartmentImages={handleViewDepartmentImages}
          onViewAdminAnalysis={handleViewAdminAnalysis}
          onViewTicketAnalysis={handleViewTicketAnalysis}
          onViewBookmarks={handleViewBookmarks}
          onDepartmentLogoClick={closeAllViews}
          onClearNotifications={clearAllNotifications}
          hasNotifications={totalBrowserNotifications > 0}
          totalNotifications={totalNotifications}
          escalationCount={escalationCount}
          ticketMessageCounts={ticketMessageCounts}
          departmentNotifications={departmentNotifications}
          onOpenTicketChat={handleOpenTicketChat}
          onAssignTicket={handleAssignTicket}
          onResolveTicket={handleResolveTicket}
          onReferTicket={(ticket) => {
            // Refer ticket functionality will be handled by modal in MobileAdminDashboard
          }}
          onEscalateTicket={handleOpenEscalationModal}
          isBookmarked={isBookmarked}
          onBookmark={addBookmark}
          onRemoveBookmark={removeBookmark}
          onOpenTeamManager={() => setShowTeamManager(true)}
          onOpenITTeam={() => setShowITTeamManager(true)}
          onOpenBranding={() => setShowBrandingManager(true)}
          onOpenLogo={() => setShowLogoManager(true)}
          onRefreshTickets={fetchTickets}
          onShowAllTickets={loadAllTickets}
        />

        {/* Modals for Mobile */}
        <DashboardModals
          selectedTicketForEscalation={selectedTicketForEscalation}
          showEscalatedTickets={showEscalatedTickets}
          onCloseEscalationModal={handleCloseEscalationModal}
          onEscalationSuccess={handleEscalationSuccess}
          onCloseEscalatedTickets={handleCloseEscalatedTickets}
          onTicketResolved={handleTicketResolved}
        />

        {/* Ticket Chat Modal - Global for Mobile */}
        {selectedTicket && (
          <TicketChat
            ticket={selectedTicket}
            isOpen={!!selectedTicket}
            onClose={handleCloseTicketChat}
            onTicketUpdated={fetchTickets}
            onMessagesViewed={clearNotificationForTicket}
          />
        )}

        {/* Team Manager Modals */}
        <DigitalizationTeamManager 
          isOpen={showTeamManager}
          onClose={() => setShowTeamManager(false)}
        />
        
        <ITTeamManager 
          isOpen={showITTeamManager}
          onClose={() => setShowITTeamManager(false)}
        />
        
        <BrandingManager 
          isOpen={showBrandingManager}
          onClose={() => setShowBrandingManager(false)}
        />
        
        <LogoManager 
          isOpen={showLogoManager}
          onClose={() => setShowLogoManager(false)}
        />

        {/* View Sections for Mobile (rendered in full screen) */}
        {isAnyViewActive && (
          <div className="fixed inset-0 z-50 bg-background">
            <AdminDashboardViewSection
              showUserPresence={showUserPresence}
              showDepartmentUsers={showDepartmentUsers}
              showDepartmentImages={showDepartmentImages}
              showAdminAnalysis={showAdminAnalysis}
              showTicketAnalysis={showTicketAnalysis}
              showBookmarks={showBookmarks}
              departments={departments}
              onCloseView={closeAllViews}
              onDepartmentImagesRefresh={fetchTickets}
              onOpenTicketChat={handleOpenTicketChat}
            />
          </div>
        )}
      </>
    );
  }

  // Desktop UI - Original layout
  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <DashboardHeader
        profileName={profile?.full_name || 'Admin'}
        departmentCode={profile?.department_code}
        onSignOut={signOut}
        onViewUsers={handleViewUsers}
        onViewDepartmentUsers={handleViewDepartmentUsers}
        onViewDepartmentImages={handleViewDepartmentImages}
        onViewAdminAnalysis={handleViewAdminAnalysis}
        onViewTicketAnalysis={handleViewTicketAnalysis}
        onViewBookmarks={handleViewBookmarks}
        onDepartmentLogoClick={closeAllViews}
        onClearNotifications={clearAllNotifications}
        hasNotifications={totalBrowserNotifications > 0}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications Panel */}
        <NotificationsPanel
          showNotifications={showNotifications}
          totalNotifications={totalNotifications}
          departmentNotifications={departmentNotifications}
          userNotifications={userNotifications}
          profileId={profile?.id || ''}
          onSetSelectedDepartment={setSelectedDepartment}
          onFetchTickets={fetchTickets}
          onClose={() => setShowNotifications(false)}
        />

        {/* Posts Section */}
        <div className="mb-8">
          <PostsSection />
        </div>

        {/* Conditional rendering: Show either dashboard tabs OR view section */}
        {!isAnyViewActive ? (
          /* Admin Dashboard Tabs - Only show when no view is active */
          <AdminDashboardTabs
            tickets={tickets}
            stats={stats}
            departments={departments}
            selectedDepartment={selectedDepartment}
            loading={loading}
            hasMore={hasMore}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onGoToPage={goToPage}
            onFirstPage={goToFirstPage}
            onPreviousPage={goToPreviousPage}
            onNextPage={goToNextPage}
            onLastPage={goToLastPage}
            showAllTickets={showAllTickets}
            onToggleShowAll={setShowAllTickets}
            departmentNotifications={departmentNotifications}
            userNotifications={userNotifications}
            ticketMessageCounts={ticketMessageCounts}
            resolvingTickets={resolvingTickets}
            canReferTicket={canReferTicket}
            canEscalateTicket={canEscalateTicket}
            profile={profile}
            onDepartmentChange={setSelectedDepartment}
            onAssignTicket={handleAssignTicket}
            onResolveTicket={(ticketId, ticketNumber, resolutionNote) => handleResolveTicket(ticketId, ticketNumber, resolutionNote)}
            onOpenTicketChat={handleOpenTicketChat}
            onCloseTicketChat={handleCloseTicketChat}
            onTicketsUpdate={fetchTickets}
            onEscalateTicket={handleOpenEscalationModal}
            clearNotificationForTicket={clearNotificationForTicket}
            isBookmarked={isBookmarked}
            getBookmarkInfo={getBookmarkInfo}
            onBookmark={addBookmark}
            onRemoveBookmark={removeBookmark}
          />
        ) : (
          /* Dashboard Views Section - Only show when a view is active */
          <AdminDashboardViewSection
            showUserPresence={showUserPresence}
            showDepartmentUsers={showDepartmentUsers}
            showDepartmentImages={showDepartmentImages}
            showAdminAnalysis={showAdminAnalysis}
            showTicketAnalysis={showTicketAnalysis}
            showBookmarks={showBookmarks}
            departments={departments}
            onCloseView={closeAllViews}
            onDepartmentImagesRefresh={fetchTickets}
            onOpenTicketChat={handleOpenTicketChat}
          />
        )}
      </div>

      {/* Floating Action Buttons */}
      <FloatingActions
        tickets={tickets}
        totalNotifications={totalNotifications}
        referralCount={referralCount}
        onOpenEscalatedTickets={handleOpenEscalatedTickets}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
        onOpenDigitalizationTeam={() => setShowTeamManager(true)}
        onOpenITTeam={() => setShowITTeamManager(true)}
      />

      {/* Floating Team Manager Buttons */}
      <FloatingTeamManagement
        onOpenDigitalizationTeam={() => setShowTeamManager(true)}
        onOpenITTeam={() => setShowITTeamManager(true)}
        onOpenBranding={() => setShowBrandingManager(true)}
        onOpenLogo={() => setShowLogoManager(true)}
      />

      {/* Modals */}
      <DashboardModals
        selectedTicketForEscalation={selectedTicketForEscalation}
        showEscalatedTickets={showEscalatedTickets}
        onCloseEscalationModal={handleCloseEscalationModal}
        onEscalationSuccess={handleEscalationSuccess}
        onCloseEscalatedTickets={handleCloseEscalatedTickets}
        onTicketResolved={handleTicketResolved}
      />

      {/* Ticket Chat Modal - Global for Desktop */}
      {selectedTicket && (
        <TicketChat
          ticket={selectedTicket}
          isOpen={!!selectedTicket}
          onClose={handleCloseTicketChat}
          onTicketUpdated={fetchTickets}
        onMessagesViewed={clearNotificationForTicket}
        />
      )}

      {/* Team Manager Modals */}
      <DigitalizationTeamManager 
        isOpen={showTeamManager}
        onClose={() => setShowTeamManager(false)}
      />
      
      <ITTeamManager 
        isOpen={showITTeamManager}
        onClose={() => setShowITTeamManager(false)}
      />
      
      <BrandingManager 
        isOpen={showBrandingManager}
        onClose={() => setShowBrandingManager(false)}
      />
      
      <LogoManager 
        isOpen={showLogoManager}
        onClose={() => setShowLogoManager(false)}
      />
    </div>
  );
};

export default AdminDashboardContent;
