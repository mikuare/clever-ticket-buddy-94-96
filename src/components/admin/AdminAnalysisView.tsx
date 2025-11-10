
import { useState } from 'react';
import AdminAnalyticsTable from './analysis/AdminAnalyticsTable';
import SummaryStats from './analysis/SummaryStats';
import AnalysisHeader from './analysis/AnalysisHeader';
import LoadingState from './analysis/LoadingState';
import PrecisionNotice from './analysis/PrecisionNotice';
import MethodologyExplanation from './analysis/MethodologyExplanation';
import DateFilter from './analysis/DateFilter';
import TeamFilter from './analysis/TeamFilter';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useTeamFilter } from '@/hooks/useTeamFilter';
import { useIsMobile } from '@/hooks/use-mobile';
import type { AdminAnalytics, AdminSummaryStats } from '@/types/adminAnalytics';

interface AdminAnalysisViewProps {
  adminAnalytics?: AdminAnalytics[];
  summaryStats?: AdminSummaryStats;
  loading?: boolean;
}

const AdminAnalysisView = ({ 
  adminAnalytics: propAnalytics, 
  summaryStats: propSummaryStats, 
  loading: propLoading 
}: AdminAnalysisViewProps) => {
  const { isAdmin, isVerifyingAdmin } = useAdminAuth();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const isMobile = useIsMobile();

  // Use the hook with date filtering - this will override any props passed
  const { 
    adminAnalytics: hookAnalytics, 
    summaryStats: hookSummaryStats, 
    loading: hookLoading 
  } = useAdminAnalytics(isAdmin, isVerifyingAdmin, startDate, endDate);

  // Use hook data (which includes date filtering) or fallback to props
  const adminAnalytics = hookAnalytics || propAnalytics || [];
  const summaryStats = hookSummaryStats || propSummaryStats || {
    total_tickets_all_admins: 0,
    total_tickets_in_progress: 0,
    avg_response_time_hours: 0,
    avg_resolution_time_hours: 0,
    total_tickets_escalated_to_dev: 0,
  };
  const loading = hookLoading ?? propLoading ?? false;

  // Team filtering
  const {
    selectedTeam,
    setSelectedTeam,
    filteredAdmins,
    teamCounts
  } = useTeamFilter(adminAnalytics);

  // Calculate team-specific summary stats when filtering
  const getTeamSpecificSummary = (): AdminSummaryStats => {
    if (selectedTeam === 'all') {
      return summaryStats;
    }

    // Calculate stats based on filtered admins
    const teamSummary = filteredAdmins.reduce((acc, admin) => {
      acc.total_tickets_all_admins += admin.total_tickets_catered;
      acc.total_tickets_in_progress += admin.tickets_in_progress;
      acc.total_tickets_escalated_to_dev += admin.tickets_escalated;
      return acc;
    }, {
      total_tickets_all_admins: 0,
      total_tickets_in_progress: 0,
      avg_response_time_hours: 0,
      avg_resolution_time_hours: 0,
      total_tickets_escalated_to_dev: 0,
    });

    // Calculate average response and resolution times
    if (filteredAdmins.length > 0) {
      teamSummary.avg_response_time_hours = filteredAdmins.reduce((sum, admin) => 
        sum + admin.avg_response_time_hours, 0) / filteredAdmins.length;
      teamSummary.avg_resolution_time_hours = filteredAdmins.reduce((sum, admin) => 
        sum + admin.avg_resolution_time_hours, 0) / filteredAdmins.length;
    }

    return teamSummary;
  };

  const teamSpecificSummary = getTeamSpecificSummary();

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <AnimatedContainer variant={isMobile ? 'content' : 'page'} className={isMobile ? 'space-y-4' : 'space-y-6'}>
      <AnalysisHeader />
      
      <DateFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClearFilter={handleClearFilter}
      />
      
      <TeamFilter
        selectedTeam={selectedTeam}
        onTeamChange={setSelectedTeam}
        digitalizationCount={teamCounts.digitalization}
        itCount={teamCounts.it}
        totalCount={teamCounts.total}
      />
      
      <SummaryStats summaryStats={teamSpecificSummary} selectedTeam={selectedTeam} />
      
      <AdminAnalyticsTable adminAnalytics={filteredAdmins} />
      
      <PrecisionNotice />
      
      <MethodologyExplanation />
    </AnimatedContainer>
  );
};

export default AdminAnalysisView;
