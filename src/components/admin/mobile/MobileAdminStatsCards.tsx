import { TicketIcon, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileAdminStatsCardsProps {
  stats: {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
}

const MobileAdminStatsCards = ({ stats }: MobileAdminStatsCardsProps) => {
  const total = stats.open + stats.inProgress + stats.resolved + stats.closed;

  return (
    <div className="space-y-3">
      {/* Total Tickets - Full Width */}
      <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Tickets</p>
            <p className="text-3xl font-bold text-foreground mt-1">{total}</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <TicketIcon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </Card>

      {/* Stats Grid - 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Open"
          value={stats.open}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
          percentage={total > 0 ? Math.round((stats.open / total) * 100) : 0}
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={<Clock className="w-5 h-5" />}
          color="yellow"
          percentage={total > 0 ? Math.round((stats.inProgress / total) * 100) : 0}
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          icon={<CheckCircle className="w-5 h-5" />}
          color="blue"
          percentage={total > 0 ? Math.round((stats.resolved / total) * 100) : 0}
        />
        <StatCard
          label="Closed"
          value={stats.closed}
          icon={<XCircle className="w-5 h-5" />}
          color="green"
          percentage={total > 0 ? Math.round((stats.closed / total) * 100) : 0}
        />
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon,
  color,
  percentage
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'red' | 'yellow' | 'blue' | 'green';
  percentage: number;
}) => {
  const colorClasses = {
    red: 'from-red-500/10 to-red-500/5 border-red-500/20 text-red-600',
    yellow: 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 text-yellow-600',
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-600',
    green: 'from-green-500/10 to-green-500/5 border-green-500/20 text-green-600'
  };

  const iconColorClasses = {
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600',
    green: 'text-green-600'
  };

  return (
    <Card className={cn('p-3 bg-gradient-to-br', colorClasses[color])}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium text-foreground">{label}</p>
        <div className={iconColorClasses[color]}>{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{percentage}%</p>
      </div>
    </Card>
  );
};

export default MobileAdminStatsCards;

