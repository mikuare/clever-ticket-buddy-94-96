
import UserStatsCards from '@/components/user/UserStatsCards';
import CreateTicketForm from '@/components/user/CreateTicketForm';
import UserTicketsList from '@/components/user/UserTicketsList';
import type { Ticket } from '@/hooks/useUserTickets';
import { useIsMobile } from '@/hooks/use-mobile';
import PostsSection from '@/components/posts/PostsSection';

interface UserDashboardContentProps {
  tickets: Ticket[];
  classificationCooldowns: Map<string, boolean>;
  canCreateTicketForClassification: (classification: string) => boolean;
  onTicketCreated: (classification: string) => void;
  onViewTicket: (ticket: Ticket) => void;
  onTicketsUpdate: () => void;
  ticketMessageCounts: Map<string, number>;
}

const UserDashboardContent = ({
  tickets,
  classificationCooldowns,
  canCreateTicketForClassification,
  onTicketCreated,
  onViewTicket,
  onTicketsUpdate,
  ticketMessageCounts
}: UserDashboardContentProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4 py-4' : 'px-4 sm:px-6 lg:px-8 py-8'}`}>
      {/* Posts Section */}
      <div className="mb-8">
        <PostsSection />
      </div>

      {/* Ticket Status Overview - Left aligned horizontal layout */}
      <UserStatsCards tickets={tickets} />
      
      {/* Create Ticket Form - Now with dialog popup */}
      <CreateTicketForm 
        classificationCooldowns={classificationCooldowns}
        canCreateTicketForClassification={canCreateTicketForClassification}
        onTicketCreated={onTicketCreated}
      />

      {/* Tickets List */}
      <UserTicketsList 
        tickets={tickets}
        onViewTicket={onViewTicket}
        onTicketsUpdate={onTicketsUpdate}
        ticketMessageCounts={ticketMessageCounts}
      />
    </div>
  );
};

export default UserDashboardContent;
