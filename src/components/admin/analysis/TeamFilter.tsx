import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Monitor, Wrench } from 'lucide-react';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { useIsMobile } from '@/hooks/use-mobile';

export type TeamFilterType = 'all' | 'digitalization' | 'it';

interface TeamFilterProps {
  selectedTeam: TeamFilterType;
  onTeamChange: (team: TeamFilterType) => void;
  digitalizationCount: number;
  itCount: number;
  totalCount: number;
}

const TeamFilter = ({
  selectedTeam,
  onTeamChange,
  digitalizationCount,
  itCount,
  totalCount
}: TeamFilterProps) => {
  const isMobile = useIsMobile();
  const getTeamIcon = (team: TeamFilterType) => {
    switch (team) {
      case 'digitalization':
        return <Monitor className="w-4 h-4" />;
      case 'it':
        return <Wrench className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getTeamLabel = (team: TeamFilterType) => {
    switch (team) {
      case 'digitalization':
        return 'Digitalization Team';
      case 'it':
        return 'IT Team';
      default:
        return 'All Teams';
    }
  };

  const getTeamCount = (team: TeamFilterType) => {
    switch (team) {
      case 'digitalization':
        return digitalizationCount;
      case 'it':
        return itCount;
      default:
        return totalCount;
    }
  };

  return (
    <AnimatedContainer variant="card" className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 text-purple-700 font-medium">
          {getTeamIcon(selectedTeam)}
          <span>Filter by Team</span>
        </div>
        
        <div className={`flex flex-wrap items-center gap-3 ${isMobile ? 'w-full' : ''}`}>
          <Select value={selectedTeam} onValueChange={(value: TeamFilterType) => onTeamChange(value)}>
            <SelectTrigger className={`${isMobile ? 'w-full' : 'w-[200px]'} border-purple-300`}>
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  All Teams
                  <Badge variant="secondary" className="ml-1">
                    {totalCount}
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="digitalization">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Digitalization Team
                  <Badge variant="secondary" className="ml-1">
                    {digitalizationCount}
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="it">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  IT Team
                  <Badge variant="secondary" className="ml-1">
                    {itCount}
                  </Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={`text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full ${isMobile ? 'w-full text-center' : ''}`}>
          Showing {getTeamCount(selectedTeam)} {getTeamCount(selectedTeam) === 1 ? 'admin' : 'admins'} from {getTeamLabel(selectedTeam).toLowerCase()}
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default TeamFilter;