
import { type ReactNode } from 'react';
import UserPresenceView from '@/components/admin/UserPresenceView';
import DepartmentUserManagement from '@/components/admin/DepartmentUserManagement';
import DepartmentImageManager from '@/components/admin/DepartmentImageManager';
import AdminAnalysisView from '@/components/admin/AdminAnalysisView';
import TicketAnalysisView from '@/components/admin/TicketAnalysisView';
import BookmarksView from '@/components/admin/BookmarksView';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();

  const BackButton = ({ className = '' }: { className?: string }) => (
    <div className={`text-center mt-6 ${isMobile ? 'w-full' : ''}`}>
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
        className={`inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg border-2 border-primary/20 ${isMobile ? 'w-full justify-center' : ''} ${className}`}
      >
        ← Back to Dashboard
      </button>
    </div>
  );

  const renderView = (content: ReactNode) => {
    if (isMobile) {
      return (
        <AnimatedContainer variant="content" className="h-full flex flex-col animate-fade-in">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 pb-24 pt-2">
              {content}
            </div>
          </ScrollArea>
          <div className="px-4 pb-4">
            <BackButton />
          </div>
        </AnimatedContainer>
      );
    }

    return (
      <AnimatedContainer variant="content" className="animate-fade-in">
        {content}
        <BackButton />
      </AnimatedContainer>
    );
  };

  if (showUserPresence) {
    return renderView(<UserPresenceView departments={departments} />);
  }

  if (showDepartmentUsers) {
    return renderView(<DepartmentUserManagement departments={departments} />);
  }

  if (showDepartmentImages) {
    return renderView(
      <DepartmentImageManager 
        departments={departments}
        onRefresh={onDepartmentImagesRefresh}
      />
    );
  }

  if (showAdminAnalysis) {
    return renderView(<AdminAnalysisView />);
  }

  if (showTicketAnalysis) {
    return renderView(<TicketAnalysisView />);
  }

  if (showBookmarks) {
    return renderView(<BookmarksView onOpenTicket={onOpenTicketChat} />);
  }

  return null;
};

export default AdminDashboardViewSection;
