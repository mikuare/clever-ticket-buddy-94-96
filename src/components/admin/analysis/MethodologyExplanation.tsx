
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Database, Users, Shield } from 'lucide-react';
import { AnimatedContainer } from '@/components/ui/animated-container';

const MethodologyExplanation = () => {
  return (
    <AnimatedContainer variant="card">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Enhanced Precision Analytics Methodology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <h4 className="font-semibold text-purple-700">Enhanced Response Time Precision</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-5">
                Combines direct assignments and referral acceptances using exact timestamps from ticket progression logs.
              </p>
              <div className="ml-5 text-xs text-purple-600 bg-purple-50 p-2 rounded">
                <strong>Direct:</strong> User submits at 2:17:15 → Admin caters at 2:18:30 = 1m 15s
              </div>
              <div className="ml-5 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                <strong>Referral:</strong> Admin refers at 3:20:00 → Receiving admin accepts at 3:22:30 = 2m 30s
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <h4 className="font-semibold text-green-700">Comprehensive Resolution Tracking</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-5">
                Measures from assignment/acceptance timestamp to resolution using progression activity logs.
              </p>
              <div className="ml-5 text-xs text-green-600 bg-green-50 p-2 rounded">
                <strong>Standard:</strong> Assigned at 2:18:30 → Resolved at 2:25:45 = 7m 15s
              </div>
              <div className="ml-5 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                <strong>Referred:</strong> Accepted at 3:22:30 → Resolved at 3:28:15 = 5m 45s
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <h4 className="font-semibold text-orange-700">Deduplicated Escalation Metrics</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-5">
                Escalation counts use DISTINCT to prevent duplicate counting when tickets are referred multiple times.
              </p>
              <div className="ml-5 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                <strong>Example:</strong> Ticket referred 3 times = counted as 1 escalation per unique ticket
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <h4 className="font-semibold text-red-700">Anti-Abuse Protection</h4>
              </div>
              <p className="text-sm text-muted-foreground ml-5">
                5-minute cooldown enforced at database level prevents referral abuse while maintaining accurate metrics.
              </p>
              <div className="ml-5 text-xs text-red-600 bg-red-50 p-2 rounded">
                <strong>Protection:</strong> Same ticket can only be referred once every 5 minutes by the same admin
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <Database className="w-5 h-5 text-green-600" />
              <Users className="w-5 h-5 text-purple-600" />
              <Shield className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-blue-900">Advanced Ticket Progression Analytics</h4>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-blue-800">
                <strong>🎯 Enhanced Data Integration:</strong> Combines direct assignments and referral workflows using 
                precise ticket progression timestamps for comprehensive performance analysis.
              </p>
              <p className="text-purple-700">
                <strong>📊 Referral-Aware Metrics:</strong> Response and resolution times now include referral handling, 
                providing accurate performance insights for both direct and collaborative ticket management.
              </p>
              <p className="text-green-700">
                <strong>🔍 Second-Level Precision:</strong> All timing calculations maintain second-level accuracy across 
                direct assignments, referrals, acceptances, and resolutions.
              </p>
              <p className="text-red-700">
                <strong>🛡️ Abuse Prevention:</strong> Database-enforced cooldowns and deduplication ensure metrics 
                integrity while preventing system manipulation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimatedContainer>
  );
};

export default MethodologyExplanation;
