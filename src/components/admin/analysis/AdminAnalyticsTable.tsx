
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { AnimatedContainer } from '@/components/ui/animated-container';
import TimeMetricChart from '../TimeMetricChart';
import { useIsMobile } from '@/hooks/use-mobile';
import type { AdminAnalytics } from '@/types/adminAnalytics';

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

interface AdminAnalyticsTableProps {
  adminAnalytics: AdminAnalytics[];
}

// Mobile Card View Component
const MobileAdminCard = ({ admin }: { admin: AdminAnalytics }) => (
  <Card className="mb-3">
    <CardHeader className="pb-3">
      <div className="space-y-1">
        <div className="font-semibold text-sm">{admin.admin_name}</div>
        <div className="text-xs text-muted-foreground">{admin.email}</div>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      {/* Tickets Overview */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-blue-50 rounded-lg p-2">
          <div className="text-xs text-muted-foreground">Total Tickets</div>
          <div className="text-lg font-bold text-blue-600">{admin.total_tickets_catered}</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-2">
          <div className="text-xs text-muted-foreground">In Progress</div>
          <div className="text-lg font-bold text-orange-600">{admin.tickets_in_progress}</div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-green-600" />
          <span className="text-xs">Resolved:</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">{admin.tickets_resolved}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-red-600" />
          <span className="text-xs">Escalated:</span>
          <Badge variant="secondary" className="bg-red-100 text-red-800">{admin.tickets_escalated}</Badge>
        </div>
      </div>

      {/* Time Metrics */}
      <div className="border-t pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-purple-600" />
            <span className="text-xs text-muted-foreground">Response Time</span>
          </div>
          <span className="text-sm font-semibold text-purple-700">
            {admin.avg_response_time_hours > 0 ? formatTimeFromHours(admin.avg_response_time_hours) : '-'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-green-600" />
            <span className="text-xs text-muted-foreground">Resolution Time</span>
          </div>
          <span className="text-sm font-semibold text-green-700">
            {admin.avg_resolution_time_hours > 0 ? formatTimeFromHours(admin.avg_resolution_time_hours) : '-'}
          </span>
        </div>
      </div>

      {/* Time Chart */}
      <div className="flex justify-center pt-2">
        <TimeMetricChart 
          responseTime={admin.avg_response_time_hours}
          resolutionTime={admin.avg_resolution_time_hours}
        />
      </div>
    </CardContent>
  </Card>
);

const AdminAnalyticsTable = ({ adminAnalytics }: AdminAnalyticsTableProps) => {
  const isMobile = useIsMobile();

  return (
    <AnimatedContainer variant="card">
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base flex-wrap' : ''}`}>
            <Users className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
            {isMobile ? "Admin Performance" : "Individual Admin Performance Metrics"}
            <Badge variant="outline" className={`text-blue-600 border-blue-200 ${isMobile ? 'text-xs' : 'ml-2'}`}>
              Progression Data
            </Badge>
          </CardTitle>
          {!isMobile && (
            <p className="text-sm text-muted-foreground mt-2">
              Precision timing calculations derived from actual ticket progression logs for maximum accuracy and reliability
            </p>
          )}
        </CardHeader>
        <CardContent>
          {adminAnalytics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No admin data available
            </div>
          ) : isMobile ? (
            // Mobile Card View
            <div className="space-y-3">
              {adminAnalytics.map((admin) => (
                <MobileAdminCard key={admin.admin_id} admin={admin} />
              ))}
            </div>
          ) : (
            // Desktop Table View
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Administrator</TableHead>
                    <TableHead className="text-center min-w-[100px]">Total Tickets</TableHead>
                    <TableHead className="text-center min-w-[100px]">In Progress</TableHead>
                    <TableHead className="text-center min-w-[100px]">Resolved</TableHead>
                    <TableHead className="text-center min-w-[100px]">Escalated</TableHead>
                    <TableHead className="text-center min-w-[140px]">Response Time</TableHead>
                    <TableHead className="text-center min-w-[140px]">Resolution Time</TableHead>
                    <TableHead className="text-center min-w-[160px]">Time Analysis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminAnalytics.map((admin) => (
                    <TableRow key={admin.admin_id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{admin.admin_name}</div>
                          <div className="text-xs text-muted-foreground">{admin.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-semibold text-lg text-blue-600">
                          {admin.total_tickets_catered}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={admin.tickets_in_progress > 0 ? "default" : "secondary"}
                          className={admin.tickets_in_progress > 0 ? "bg-orange-100 text-orange-800 hover:bg-orange-100" : ""}
                        >
                          {admin.tickets_in_progress}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={admin.tickets_resolved > 0 ? "default" : "secondary"} 
                          className={admin.tickets_resolved > 0 ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                        >
                          {admin.tickets_resolved}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={admin.tickets_escalated > 0 ? "destructive" : "secondary"}
                        >
                          {admin.tickets_escalated}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-semibold text-purple-700">
                            {admin.avg_response_time_hours > 0 ? formatTimeFromHours(admin.avg_response_time_hours) : '-'}
                          </span>
                          <span className="text-xs text-purple-500 leading-tight text-center">
                            Creation → Assignment
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-semibold text-green-700">
                            {admin.avg_resolution_time_hours > 0 ? formatTimeFromHours(admin.avg_resolution_time_hours) : '-'}
                          </span>
                          <span className="text-xs text-green-500 leading-tight text-center">
                            Assignment → Resolution
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <TimeMetricChart 
                            responseTime={admin.avg_response_time_hours}
                            resolutionTime={admin.avg_resolution_time_hours}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
};

export default AdminAnalyticsTable;
