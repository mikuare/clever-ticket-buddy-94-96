import { useITTeam } from '@/hooks/useITTeam';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';

const ITTeam = () => {
  const { teamMembers, loading } = useITTeam();

  if (loading) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold text-foreground">IT Team</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center space-y-3">
              <Skeleton className="w-32 h-32 rounded-full" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <div className="text-center space-y-4">
        <Users className="w-16 h-16 mx-auto text-muted-foreground" />
        <h3 className="text-xl font-semibold text-foreground">IT Team</h3>
        <p className="text-muted-foreground">No IT team members available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-8">
      <div className="flex items-center justify-center gap-3">
        <Users className="w-6 h-6 text-primary" />
        <h3 className="text-2xl font-bold text-foreground">IT Team</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {teamMembers.map((member) => (
          <div key={member.id} className="flex flex-col items-center space-y-4 group">
            <div className="relative">
              <img
                src={member.image_url}
                alt={member.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-primary/20 group-hover:border-primary/40 transition-all duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=3b82f6&color=ffffff&size=128`;
                }}
              />
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold text-foreground">{member.name}</h4>
              <p className="text-sm text-muted-foreground">{member.job_title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ITTeam;