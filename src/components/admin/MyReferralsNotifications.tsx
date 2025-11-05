import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ReferralService } from '@/services/referralService';
import type { ReferralNotification } from '@/types/referral';

interface MyReferralsNotificationsProps {
  adminId: string;
}

const MyReferralsNotifications = ({ adminId }: MyReferralsNotificationsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [referrals, setReferrals] = useState<ReferralNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyReferrals = async () => {
    if (!adminId) return;
    
    try {
      setLoading(true);
      const data = await ReferralService.fetchReferralsMadeByAdmin(adminId);
      setReferrals(data);
    } catch (error) {
      console.error('Error fetching my referrals:', error);
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReferrals();
    
    // Set up real-time subscription for referral status changes
    if (adminId) {
      const channel = supabase
        .channel(`my-referrals-${adminId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ticket_referrals',
            filter: `referring_admin_id=eq.${adminId}`
          },
          () => {
            // Refresh referrals when any status change occurs
            fetchMyReferrals();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [adminId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'declined': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-50 border-green-200';
      case 'declined': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const acceptedReferrals = referrals.filter(r => r.status === 'accepted');
  const pendingReferrals = referrals.filter(r => r.status === 'pending');

  if (referrals.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="fixed bottom-6 right-[220px] z-50 bg-indigo-500 hover:bg-indigo-600 text-white p-4 rounded-full shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 group">
          <Share2 className="w-6 h-6" />
          {acceptedReferrals.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {acceptedReferrals.length}
            </div>
          )}
          <div className="absolute bottom-full right-0 mb-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            My Referrals Status
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            My Referrals Status
            {acceptedReferrals.length > 0 && (
              <Badge className="bg-green-500 text-white">
                {acceptedReferrals.length} accepted
              </Badge>
            )}
            {pendingReferrals.length > 0 && (
              <Badge className="bg-blue-500 text-white">
                {pendingReferrals.length} pending
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Status of tickets you referred to other admins
          </p>
          
          <div className="space-y-3">
            {referrals.map((referral) => (
              <Card 
                key={referral.id}
                className={`${getStatusColor(referral.status)}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant={referral.status === 'accepted' ? 'default' : 'secondary'}
                          className={`text-xs ${
                            referral.status === 'accepted' 
                              ? 'bg-green-500 text-white' 
                              : referral.status === 'declined'
                              ? 'bg-red-500 text-white'
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          {referral.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">
                          {referral.ticket.ticket_number}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">
                        {referral.ticket.title}
                      </p>
                      <p className="text-xs text-gray-600 mb-1">
                        Referred to: {referral.referred_admin?.full_name || 'Admin'}
                      </p>
                      {referral.status === 'accepted' && referral.responded_at && (
                        <div className="text-xs text-green-600 font-medium mb-1 bg-green-100 px-2 py-1 rounded">
                          ✓ Accepted on {new Date(referral.responded_at).toLocaleString()}
                        </div>
                      )}
                      {referral.status === 'declined' && referral.responded_at && (
                        <div className="text-xs text-red-600 font-medium mb-1 bg-red-100 px-2 py-1 rounded">
                          ✗ Declined on {new Date(referral.responded_at).toLocaleString()}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Referred: {new Date(referral.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(referral.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MyReferralsNotifications;