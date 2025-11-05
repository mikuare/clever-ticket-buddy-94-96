import { useITTeam } from '@/hooks/useITTeam';
import { Card, CardContent } from '@/components/ui/card';

const ITTeamAuth = () => {
  const { teamMembers, loading } = useITTeam();

  if (loading) {
    return (
      <div className="mt-8 text-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
        <p className="text-white/60 mt-2 text-sm">Loading IT team...</p>
      </div>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <div className="mt-8 text-center">
        <p className="text-white/60 text-sm">No IT team members are currently available</p>
      </div>
    );
  }

  return (
    <div className="mt-8 w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">IT Team</h3>
        <p className="text-white/80 text-sm">Meet our IT support team members</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {teamMembers.map((member) => (
          <Card key={member.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardContent className="p-4 text-center">
              {/* Square format image for main pages */}
              <div className="w-20 h-20 mx-auto mb-3 rounded-lg overflow-hidden bg-white/20 border border-white/30">
                {member.image_url ? (
                  <img 
                    src={member.image_url} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', member.image_url);
                      // Show fallback initials if image fails to load
                      const target = e.currentTarget;
                      const fallback = document.createElement('div');
                      fallback.className = 'w-full h-full flex items-center justify-center text-white/80 font-semibold text-lg bg-white/20';
                      fallback.textContent = member.name.split(' ').map(n => n[0]).join('').toUpperCase();
                      target.parentNode?.replaceChild(fallback, target);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/80 font-semibold text-lg">
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                )}
              </div>
              
              <h4 className="font-medium text-white mb-1 text-sm">{member.name}</h4>
              
              {/* Job Title */}
              <p className="text-white/70 text-xs mt-1">{member.job_title}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ITTeamAuth;