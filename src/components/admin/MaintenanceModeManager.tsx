import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Calendar, Clock, Plus, Power, PowerOff, Trash2 } from 'lucide-react';
import { useMaintenanceMode } from '@/hooks/useMaintenanceMode';
import { format } from 'date-fns';

const MaintenanceModeManager = () => {
  const {
    maintenanceStatus,
    sessions,
    loading,
    enableImmediateMaintenance,
    disableImmediateMaintenance,
    scheduleMaintenanceSession,
    cancelMaintenanceSession,
  } = useMaintenanceMode();

  const [immediateDialog, setImmediateDialog] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [immediateTitle, setImmediateTitle] = useState('System Under Maintenance');
  const [immediateDescription, setImmediateDescription] = useState('');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleEnableImmediate = async () => {
    setProcessing(true);
    try {
      await enableImmediateMaintenance(immediateTitle, immediateDescription || undefined);
      setImmediateDialog(false);
      setImmediateTitle('System Under Maintenance');
      setImmediateDescription('');
    } catch (error) {
      console.error('Error enabling immediate maintenance:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDisableImmediate = async () => {
    setProcessing(true);
    try {
      await disableImmediateMaintenance();
    } catch (error) {
      console.error('Error disabling immediate maintenance:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleScheduleMaintenance = async () => {
    if (!scheduleTitle || !startDateTime) return;

    setProcessing(true);
    try {
      const startDate = new Date(startDateTime);
      const endDate = endDateTime ? new Date(endDateTime) : undefined;
      
      await scheduleMaintenanceSession(
        scheduleTitle,
        startDate,
        endDate,
        scheduleDescription || undefined
      );
      
      setScheduleDialog(false);
      setScheduleTitle('');
      setScheduleDescription('');
      setStartDateTime('');
      setEndDateTime('');
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    setProcessing(true);
    try {
      await cancelMaintenanceSession(sessionId);
    } catch (error) {
      console.error('Error cancelling session:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'No end time';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const currentImmediateMaintenance = sessions.find(s => s.is_immediate && s.is_active);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {maintenanceStatus.inMaintenance ? (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            ) : (
              <Clock className="h-5 w-5 text-emerald-500" />
            )}
            Maintenance Mode Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge 
                variant={maintenanceStatus.inMaintenance ? "destructive" : "secondary"}
                className="mb-2"
              >
                {maintenanceStatus.inMaintenance ? "ACTIVE" : "INACTIVE"}
              </Badge>
              {maintenanceStatus.inMaintenance && (
                <div className="space-y-1">
                  <p className="font-medium">{maintenanceStatus.maintenanceTitle}</p>
                  {maintenanceStatus.maintenanceDescription && (
                    <p className="text-sm text-muted-foreground">
                      {maintenanceStatus.maintenanceDescription}
                    </p>
                  )}
                  {maintenanceStatus.maintenanceEndTime && (
                    <p className="text-sm text-muted-foreground">
                      Ends: {formatDateTime(maintenanceStatus.maintenanceEndTime)}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {currentImmediateMaintenance ? (
              <Button 
                onClick={handleDisableImmediate}
                disabled={processing}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <PowerOff className="h-4 w-4" />
                Disable Maintenance
              </Button>
            ) : (
              <Dialog open={immediateDialog} onOpenChange={setImmediateDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Power className="h-4 w-4" />
                    Enable Immediate Maintenance
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Enable Immediate Maintenance</DialogTitle>
                    <DialogDescription>
                      This will immediately restrict access for all non-admin users.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="immediate-title">Title</Label>
                      <Input
                        id="immediate-title"
                        value={immediateTitle}
                        onChange={(e) => setImmediateTitle(e.target.value)}
                        placeholder="System Under Maintenance"
                      />
                    </div>
                    <div>
                      <Label htmlFor="immediate-description">Description (Optional)</Label>
                      <Textarea
                        id="immediate-description"
                        value={immediateDescription}
                        onChange={(e) => setImmediateDescription(e.target.value)}
                        placeholder="Please try again later..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setImmediateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleEnableImmediate} disabled={processing}>
                      Enable Maintenance
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Maintenance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Maintenance
              </CardTitle>
              <CardDescription>
                Schedule maintenance sessions in advance
              </CardDescription>
            </div>
            <Dialog open={scheduleDialog} onOpenChange={setScheduleDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Schedule Maintenance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Maintenance Session</DialogTitle>
                  <DialogDescription>
                    Schedule a maintenance window that will automatically activate and deactivate.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="schedule-title">Title *</Label>
                    <Input
                      id="schedule-title"
                      value={scheduleTitle}
                      onChange={(e) => setScheduleTitle(e.target.value)}
                      placeholder="Scheduled System Maintenance"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="schedule-description">Description (Optional)</Label>
                    <Textarea
                      id="schedule-description"
                      value={scheduleDescription}
                      onChange={(e) => setScheduleDescription(e.target.value)}
                      placeholder="Maintenance details..."
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-datetime">Start Date/Time *</Label>
                      <Input
                        id="start-datetime"
                        type="datetime-local"
                        value={startDateTime}
                        onChange={(e) => setStartDateTime(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-datetime">End Date/Time</Label>
                      <Input
                        id="end-datetime"
                        type="datetime-local"
                        value={endDateTime}
                        onChange={(e) => setEndDateTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setScheduleDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleScheduleMaintenance} 
                    disabled={processing || !scheduleTitle || !startDateTime}
                  >
                    Schedule Maintenance
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No maintenance sessions scheduled
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{session.title}</h4>
                      <Badge variant={session.is_immediate ? "destructive" : "secondary"}>
                        {session.is_immediate ? "IMMEDIATE" : "SCHEDULED"}
                      </Badge>
                    </div>
                    {session.description && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {session.description}
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {session.is_immediate ? (
                        <span>Started: {formatDateTime(session.created_at)}</span>
                      ) : (
                        <span>
                          {formatDateTime(session.start_time)} → {formatDateTime(session.end_time)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelSession(session.id)}
                    disabled={processing}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Cancel
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceModeManager;