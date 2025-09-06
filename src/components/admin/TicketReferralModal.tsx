
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Clock, AlertCircle, Timer, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ReferralService } from '@/services/referralService';
import type { Ticket } from '@/types/admin';

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  department_code: string;
  is_online?: boolean;
}

interface TicketReferralModalProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  currentAdminId: string;
  onReferralSent: () => void;
}

const TicketReferralModal = ({ 
  ticket, 
  isOpen, 
  onClose, 
  currentAdminId, 
  onReferralSent 
}: TicketReferralModalProps) => {
  const { toast } = useToast();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [canReferThisTicket, setCanReferThisTicket] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchAdminUsers();
      checkReferralCooldown();
      checkIfTicketCanBeReferred();
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownActive && cooldownRemaining > 0) {
      interval = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            setCooldownActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownActive, cooldownRemaining]);

  const checkIfTicketCanBeReferred = async () => {
    try {
      const canRefer = await ReferralService.canReferTicket(ticket.id);
      setCanReferThisTicket(canRefer);
      
      if (!canRefer) {
        toast({
          title: "Cannot Refer Ticket",
          description: "Resolved or closed tickets cannot be referred to maintain data accuracy and prevent conflicts.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error checking if ticket can be referred:', error);
      setCanReferThisTicket(false);
    }
  };

  const checkReferralCooldown = async () => {
    try {
      const { data, error } = await supabase
        .rpc('check_referral_cooldown', {
          p_ticket_id: ticket.id,
          p_admin_id: currentAdminId
        });

      if (error) throw error;

      if (!data) {
        // Get the last referral time to calculate remaining cooldown
        const { data: lastReferral, error: referralError } = await supabase
          .from('ticket_referrals')
          .select('created_at')
          .eq('ticket_id', ticket.id)
          .eq('referring_admin_id', currentAdminId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!referralError && lastReferral) {
          const lastReferralTime = new Date(lastReferral.created_at);
          const now = new Date();
          const timeSinceLastReferral = (now.getTime() - lastReferralTime.getTime()) / 1000;
          const cooldownDuration = 5 * 60; // 5 minutes in seconds
          
          if (timeSinceLastReferral < cooldownDuration) {
            setCooldownActive(true);
            setCooldownRemaining(Math.ceil(cooldownDuration - timeSinceLastReferral));
          }
        }
      }
    } catch (error) {
      console.error('Error checking referral cooldown:', error);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const { data: admins, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, department_code')
        .eq('is_admin', true)
        .neq('id', currentAdminId);

      if (error) throw error;

      // Get presence data for online status
      const { data: presenceData } = await supabase
        .from('user_presence')
        .select('user_id, is_online')
        .in('user_id', admins?.map(admin => admin.id) || []);

      const presenceMap = new Map(presenceData?.map(p => [p.user_id, p.is_online]) || []);

      const adminsWithPresence = admins?.map(admin => ({
        ...admin,
        is_online: presenceMap.get(admin.id) || false
      })) || [];

      setAdminUsers(adminsWithPresence);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast({
        title: "Error",
        description: "Failed to load admin users",
        variant: "destructive"
      });
    }
  };

  const handleReferTicket = async () => {
    if (!canReferThisTicket) {
      toast({
        title: "Cannot Refer Ticket",
        description: "This ticket cannot be referred because it has been resolved or closed.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedAdmin) {
      toast({
        title: "No Admin Selected",
        description: "Please select an admin to refer this ticket to",
        variant: "destructive"
      });
      return;
    }

    if (cooldownActive) {
      const minutes = Math.floor(cooldownRemaining / 60);
      const seconds = cooldownRemaining % 60;
      toast({
        title: "Referral Cooldown Active",
        description: `Please wait ${minutes}m ${seconds}s before referring this ticket again`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const selectedAdminData = adminUsers.find(admin => admin.id === selectedAdmin);
      
      // Create referral record
      const { error: referralError } = await supabase
        .from('ticket_referrals')
        .insert({
          ticket_id: ticket.id,
          referring_admin_id: currentAdminId,
          referred_admin_id: selectedAdmin,
          status: 'pending',
          message: `Ticket ${ticket.ticket_number} needs additional expertise in ${ticket.department_code} department.`
        });

      if (referralError) {
        // Check if it's a cooldown error
        if (referralError.message?.includes('Referral cooldown active')) {
          toast({
            title: "Referral Cooldown Active",
            description: "Please wait 5 minutes before referring this ticket again",
            variant: "destructive"
          });
          setCooldownActive(true);
          setCooldownRemaining(300); // 5 minutes
          return;
        }
        throw referralError;
      }

      // Log activity
      await supabase
        .from('ticket_activities')
        .insert({
          ticket_id: ticket.id,
          user_id: currentAdminId,
          activity_type: 'referred',
          description: `Ticket referred to ${selectedAdminData?.full_name} for review`
        });

      toast({
        title: "Referral Sent",
        description: `Ticket has been referred to ${selectedAdminData?.full_name} for approval`
      });

      onReferralSent();
      onClose();
    } catch (error) {
      console.error('Error referring ticket:', error);
      toast({
        title: "Error",
        description: "Failed to refer ticket",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCooldownTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Refer Ticket to Another Admin
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Ticket Cannot Be Referred Warning */}
          {!canReferThisTicket && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-red-800">
                  <Ban className="w-4 h-4" />
                  <span className="font-medium">Referral Not Allowed</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  This ticket cannot be referred because it has been resolved or closed. 
                  This prevents data conflicts and ensures accurate metrics tracking.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Cooldown Warning */}
          {cooldownActive && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Timer className="w-4 h-4" />
                  <span className="font-medium">Referral Cooldown Active</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Please wait {formatCooldownTime(cooldownRemaining)} before referring this ticket again.
                  This prevents referral abuse and ensures proper ticket handling.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Ticket Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-blue-900">{ticket.title}</h4>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500 text-white">
                    {ticket.ticket_number}
                  </Badge>
                  <Badge className={
                    ticket.status === 'Resolved' || ticket.status === 'Closed' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }>
                    {ticket.status}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-blue-700 mb-2">
                Department: {ticket.department_code}
              </p>
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Clock className="w-3 h-3" />
                Enhanced referral tracking: Response and resolution times include referral handling
              </div>
            </CardContent>
          </Card>

          {/* Admin Selection - Only show if ticket can be referred */}
          {canReferThisTicket && (
            <div>
              <h3 className="font-medium mb-3">Select Admin to Refer To:</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {adminUsers.map((admin) => (
                  <Card 
                    key={admin.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedAdmin === admin.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-gray-50'
                    } ${cooldownActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !cooldownActive && setSelectedAdmin(admin.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {admin.full_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{admin.full_name}</p>
                            <p className="text-xs text-gray-500">{admin.email}</p>
                            <p className="text-xs text-gray-500">Dept: {admin.department_code}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {admin.is_online && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              Online
                            </Badge>
                          )}
                          {selectedAdmin === admin.id && (
                            <Badge className="bg-primary text-white text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Warning */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Enhanced Referral Tracking:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Referred tickets are now included in response time calculations</li>
                    <li>• Response time measured from referral to acceptance by receiving admin</li>
                    <li>• Resolution time calculated from acceptance to ticket resolution</li>
                    <li>• 5-minute cooldown prevents referral abuse and ensures proper handling</li>
                    <li>• <strong>Resolved/closed tickets cannot be referred to maintain data accuracy</strong></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleReferTicket}
            disabled={!selectedAdmin || loading || cooldownActive || !canReferThisTicket}
            className="min-w-[100px]"
          >
            {loading ? "Sending..." : 
             cooldownActive ? `Wait ${formatCooldownTime(cooldownRemaining)}` : 
             !canReferThisTicket ? "Cannot Refer" :
             "Send Referral"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketReferralModal;
