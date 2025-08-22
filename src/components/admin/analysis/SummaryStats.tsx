
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, AlertTriangle, BarChart3, Zap, Monitor, Wrench } from 'lucide-react';
import { AnimatedContainer } from '@/components/ui/animated-container';
import type { AdminSummaryStats } from '@/types/adminAnalytics';
import type { TeamFilterType } from '@/components/admin/analysis/TeamFilter';

const formatTimeFromHours = (hours: number): string => {
  if (hours === 0) return '0 sec';
  
  const totalSeconds = Math.round(hours * 3600);
  
  if (totalSeconds < 60) {
    return `${totalSeconds} sec`;
  }
  
  const totalMinutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  
  if (totalMinutes < 60) {
    if (remainingSeconds === 0) {
      return `${totalMinutes} min`;
    }
    return `${totalMinutes}m ${remainingSeconds}s`;
  }
  
  const displayHours = Math.floor(totalMinutes / 60);
  const remainingMinutesAfterHours = totalMinutes % 60;
  
  if (remainingMinutesAfterHours === 0 && remainingSeconds === 0) {
    return `${displayHours} hr`;
  }
  
  if (remainingSeconds === 0) {
    return `${displayHours}h ${remainingMinutesAfterHours}m`;
  }
  
  if (remainingMinutesAfterHours === 0) {
    return `${displayHours}h ${remainingSeconds}s`;
  }
  
  return `${displayHours}h ${remainingMinutesAfterHours}m ${remainingSeconds}s`;
};

interface SummaryStatsProps {
  summaryStats: AdminSummaryStats;
  selectedTeam?: TeamFilterType;
}

const SummaryStats = ({ summaryStats, selectedTeam = 'all' }: SummaryStatsProps) => {
  const getTeamTitle = () => {
    switch (selectedTeam) {
      case 'digitalization':
        return 'Digitalization Team Performance Summary';
      case 'it':
        return 'IT Team Performance Summary';
      default:
        return 'Overall Performance Summary';
    }
  };

  const getTeamIcon = () => {
    switch (selectedTeam) {
      case 'digitalization':
        return <Monitor className="w-5 h-5" />;
      case 'it':
        return <Wrench className="w-5 h-5" />;
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getTeamBadgeText = () => {
    switch (selectedTeam) {
      case 'digitalization':
        return 'Digitalization Team';
      case 'it':
        return 'IT Team';
      default:
        return 'Progression-Based';
    }
  };
  return (
    <AnimatedContainer variant="card">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTeamIcon()}
            {getTeamTitle()}
            <Badge variant="outline" className="ml-2 text-blue-600 border-blue-200">
              {getTeamBadgeText()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{summaryStats.total_tickets_all_admins}</div>
              <div className="text-sm text-blue-600">Total Tickets Handled</div>
            </div>
            <div className="text-center p-4 border rounded-lg bg-orange-50">
              <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700">{summaryStats.total_tickets_in_progress}</div>
              <div className="text-sm text-orange-600">Currently In Progress</div>
            </div>
            <div className="text-center p-4 border rounded-lg bg-purple-50">
              <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">
                {formatTimeFromHours(summaryStats.avg_response_time_hours)}
              </div>
              <div className="text-sm text-purple-600">Avg Response Time</div>
              <div className="text-xs text-purple-500 mt-1">Creation → Assignment</div>
            </div>
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">
                {formatTimeFromHours(summaryStats.avg_resolution_time_hours)}
              </div>
              <div className="text-sm text-green-600">Avg Resolution Time</div>
              <div className="text-xs text-green-500 mt-1">Assignment → Resolution</div>
            </div>
            <div className="text-center p-4 border rounded-lg bg-red-50">
              <Zap className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-700">{summaryStats.total_tickets_escalated_to_dev}</div>
              <div className="text-sm text-red-600">Escalated to Dev</div>
              <div className="text-xs text-red-500 mt-1">Awaiting Development</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
};

export default SummaryStats;
