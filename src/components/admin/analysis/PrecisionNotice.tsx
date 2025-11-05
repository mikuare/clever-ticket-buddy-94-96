
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Database, Users } from 'lucide-react';
import { AnimatedContainer } from '@/components/ui/animated-container';

const PrecisionNotice = () => {
  return (
    <AnimatedContainer variant="card">
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              <Database className="w-6 h-6 text-green-600" />
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2">🎯 Enhanced Precision Analytics with Referral Tracking</h4>
              <div className="space-y-2 text-sm">
                <p className="text-blue-800">
                  <strong>⚡ Real-Time Accuracy:</strong> All calculations use exact timestamps from ticket activity logs.
                  Example: Ticket created at 2:17:15 → Admin caters at 2:18:30 = exactly 1m 15s response time
                </p>
                <div className="flex items-center gap-2 text-green-700 bg-green-100 p-2 rounded">
                  <Activity className="w-4 h-4" />
                  <span>Resolution example: Catered at 2:18:30 → Resolved at 2:18:55 = exactly 25s resolution time</span>
                </div>
                <div className="flex items-center gap-2 text-purple-700 bg-purple-100 p-2 rounded">
                  <Users className="w-4 h-4" />
                  <span><strong>🔄 Referral Integration:</strong> Response times for referred tickets measured from referral timestamp to acceptance, ensuring accurate performance tracking across all admin interactions</span>
                </div>
                <p className="text-orange-700 bg-orange-100 p-2 rounded">
                  <strong>🛡️ Anti-Abuse Protection:</strong> 5-minute referral cooldown prevents system abuse while maintaining accurate escalation metrics with duplicate removal.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
};

export default PrecisionNotice;
