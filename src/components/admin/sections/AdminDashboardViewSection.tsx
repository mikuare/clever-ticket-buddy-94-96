
import UserPresenceView from '@/components/admin/UserPresenceView';
import DepartmentUserManagement from '@/components/admin/DepartmentUserManagement';
import DepartmentImageManager from '@/components/admin/DepartmentImageManager';
import AdminAnalysisView from '@/components/admin/AdminAnalysisView';
import TicketAnalysisView from '@/components/admin/TicketAnalysisView';
import BookmarksView from '@/components/admin/BookmarksView';
import { AnimatedContainer } from '@/components/ui/animated-container';
import type { Department } from '@/types/admin';

interface AdminDashboardViewSectionProps {
  showUserPresence: boolean;
  showDepartmentUsers: boolean;
  showDepartmentImages: boolean;
  showAdminAnalysis: boolean;
  showTicketAnalysis: boolean;
  showBookmarks: boolean;
  departments: Department[];
  onCloseView: () => void;
  onDepartmentImagesRefresh: () => void;
  onOpenTicketChat?: (ticket: any) => void;
}

const AdminDashboardViewSection = ({
  showUserPresence,
  showDepartmentUsers,
  showDepartmentImages,
  showAdminAnalysis,
  showTicketAnalysis,
  showBookmarks,
  departments,
  onCloseView,
  onDepartmentImagesRefresh,
  onOpenTicketChat
}: AdminDashboardViewSectionProps) => {
  const BackButton = () => (
    <div className="text-center mt-6">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Back to Dashboard clicked - executing onCloseView');
          try {
            onCloseView();
            console.log('✓ Successfully returned to dashboard');
          } catch (error) {
            console.error('Error returning to dashboard:', error);
          }
        }}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg border-2 border-primary/20"
      >
        ← Back to Dashboard
      </button>
    </div>
  );

  if (showUserPresence) {
    return (
      <AnimatedContainer variant="content" className="animate-fade-in">
        <UserPresenceView departments={departments} />
        <BackButton />
      </AnimatedContainer>
    );
  }

  if (showDepartmentUsers) {
    return (
      <AnimatedContainer variant="content" className="animate-fade-in">
        <DepartmentUserManagement departments={departments} />
        <BackButton />
      </AnimatedContainer>
    );
  }

  if (showDepartmentImages) {
    return (
      <AnimatedContainer variant="content" className="animate-fade-in">
        <DepartmentImageManager 
          departments={departments}
          onRefresh={onDepartmentImagesRefresh}
        />
        <BackButton />
      </AnimatedContainer>
    );
  }

  if (showAdminAnalysis) {
    return (
      <AnimatedContainer variant="content" className="animate-fade-in">
        <AdminAnalysisView />
        <BackButton />
      </AnimatedContainer>
    );
  }

  if (showTicketAnalysis) {
    return (
      <AnimatedContainer variant="content" className="animate-fade-in">
        <TicketAnalysisView />
        <BackButton />
      </AnimatedContainer>
    );
  }

  if (showBookmarks) {
    return (
      <AnimatedContainer variant="content" className="animate-fade-in">
        <BookmarksView onOpenTicket={onOpenTicketChat} />
        <BackButton />
      </AnimatedContainer>
    );
  }

  return null;
};

export default AdminDashboardViewSection;
