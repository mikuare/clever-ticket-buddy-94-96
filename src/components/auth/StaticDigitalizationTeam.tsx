
import { Card, CardContent } from '@/components/ui/card';
import { useDigitalizationTeam } from '@/hooks/useDigitalizationTeam';
import { useITTeam } from '@/hooks/useITTeam';

const StaticDigitalizationTeam = () => {
  const { teamMembers, loading } = useDigitalizationTeam();
  const { teamMembers: itTeamMembers, loading: itLoading } = useITTeam();

  if (loading || itLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Find team leader (display_order = 1) and other members
  const teamLeader = teamMembers.find(member => member.display_order === 1);
  const otherMembers = teamMembers.filter(member => member.display_order !== 1).sort((a, b) => a.display_order - b.display_order);

  const TeamMemberCard = ({ member, isLeader = false }) => (
    <Card 
      className={`bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 relative overflow-hidden group animate-pulse hover:animate-none ${isLeader ? 'ring-2 ring-yellow-400/50' : ''}`}
      style={{
        boxShadow: `
          0 0 20px rgba(255, 255, 255, 0.1),
          0 0 40px rgba(255, 255, 255, 0.05),
          inset 0 0 20px rgba(255, 255, 255, 0.1)
        `,
        animation: 'glow 2s ease-in-out infinite alternate'
      }}
    >
      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
      
      <CardContent className="p-4 text-center relative z-10">
        <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden bg-white/20 border-2 border-white/30 relative group-hover:border-white/50 transition-colors duration-300">
          {/* Glowing ring around avatar */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300"></div>
          <img 
            src={member.image_url} 
            alt={member.name}
            className="w-full h-full object-cover relative z-10"
            onError={(e) => {
              const target = e.currentTarget;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`;
            }}
          />
        </div>
        
        <h3 className="font-semibold text-white mb-2 text-sm group-hover:text-white/90 transition-colors duration-300">{member.name}</h3>
        
        {/* Job Position */}
        <p className="text-white/70 text-xs mb-3 group-hover:text-white/80 transition-colors duration-300">
          {member.job_title}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
          DIGITALIZATION TEAM
        </h2>
        <div className="w-16 h-1 bg-white/80 mx-auto mb-4"></div>
      </div>
      
      {/* Organizational Chart */}
      <div className="flex flex-col items-center space-y-8">
        {/* Team Leader */}
        {teamLeader && (
          <div className="flex flex-col items-center">
            <div className="w-64">
              <TeamMemberCard member={teamLeader} isLeader={true} />
            </div>
            
            {/* Vertical line from leader */}
            {otherMembers.length > 0 && (
              <>
                <div className="w-0.5 h-12 bg-white/40 mt-4"></div>
                
                {/* Horizontal connecting line with precise connection points */}
                <div className="relative">
                  <div className="w-[600px] h-0.5 bg-white/40"></div>
                  {/* Connection points positioned to align with each team member card */}
                  {otherMembers.map((_, index) => {
                    const positions = ['left-[100px]', 'left-1/2 -translate-x-0.5', 'right-[100px]'];
                    return (
                      <div 
                        key={index}
                        className={`absolute top-0 ${positions[index]} w-0.5 h-8 bg-white/40 -translate-y-0`}
                      ></div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Team Members */}
        {otherMembers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mt-0">
            {otherMembers.map((member) => (
              <div key={member.id} className="w-56">
                <TeamMemberCard member={member} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* IT Team Section */}
      {itTeamMembers.length > 0 && (
        <div className="mt-16 w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
              IT TEAM
            </h2>
            <div className="w-16 h-1 bg-white/80 mx-auto mb-4"></div>
          </div>

          <div className="flex flex-col items-center">
            <div className="pointer-events-none w-0.5 h-10 bg-white/40"></div>

            <div className="relative w-full max-w-[640px]">
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-0.5 bg-white/40"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 justify-items-center pt-12">
                {itTeamMembers.map((member, index) => (
                  <div key={member.id} className="relative flex flex-col items-center">
                    <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 w-0.5 h-12 bg-white/40"></div>
                    <div className="w-56 relative z-10">
                      <TeamMemberCard member={member} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes glow {
          0% {
            box-shadow: 
              0 0 20px rgba(255, 255, 255, 0.1),
              0 0 40px rgba(255, 255, 255, 0.05),
              inset 0 0 20px rgba(255, 255, 255, 0.1);
          }
          100% {
            box-shadow: 
              0 0 30px rgba(255, 255, 255, 0.2),
              0 0 60px rgba(255, 255, 255, 0.1),
              inset 0 0 30px rgba(255, 255, 255, 0.15);
          }
        }
      `}</style>
    </div>
  );
};

export default StaticDigitalizationTeam;
