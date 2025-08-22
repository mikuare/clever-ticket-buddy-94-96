
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { AnimatedContainer } from '@/components/ui/animated-container';
import TimeMetricChart from '../TimeMetricChart';
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

const AdminAnalyticsTable = ({ adminAnalytics }: AdminAnalyticsTableProps) => {
  return (
    <AnimatedContainer variant="card">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Individual Admin Performance Metrics
            <Badge variant="outline" className="ml-2 text-blue-600 border-blue-200">
              Progression Data Powered
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Precision timing calculations derived from actual ticket progression logs for maximum accuracy and reliability
          </p>
        </CardHeader>
        <CardContent>
          {adminAnalytics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No admin data available
            </div>
          ) : (
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
