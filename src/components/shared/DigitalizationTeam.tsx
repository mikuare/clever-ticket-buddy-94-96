
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Facebook, Instagram, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ITTeamAuth from './ITTeamAuth';

interface TeamMember {
  id: string;
  name: string;
  image_url: string;
  job_title: string;
  display_order: number;
  is_active: boolean;
}

const DigitalizationTeam = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
    
    // Set up real-time subscription for digitalization team changes
    const subscription = supabase
      .channel('digitalization-team-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'digitalization_team'
        },
        (payload) => {
          console.log('Digitalization team updated, refreshing:', payload);
          fetchTeamMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchTeamMembers = async () => {
    try {
      console.log('Fetching digitalization team members...');
      
      const { data, error } = await supabase
        .from('digitalization_team')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      console.log('Team members query result:', { data, error });

      if (error) {
        console.error('Error fetching team members:', error);
        setTeamMembers([]);
        return;
      }

      if (!data || data.length === 0) {
        console.log('No active team members found');
        setTeamMembers([]);
        return;
      }

      setTeamMembers(data);
      console.log('Loaded team members:', data);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-8 text-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
        <p className="text-white/60 mt-2 text-sm">Loading digitalization team...</p>
      </div>
    );
  }

  if (teamMembers.length === 0) {
    console.log('No team members to display');
    return (
      <div className="mt-8 text-center">
        <p className="text-white/60 text-sm">No team members are currently available</p>
      </div>
    );
  }

  return (
    <div className="mt-8 w-full max-w-6xl mx-auto space-y-12">
      {/* Digitalization Team */}
      <div className="w-full">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Digitalization Team</h3>
          <p className="text-white/80 text-sm">Meet our dedicated team members</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* IT Team */}
      <ITTeamAuth />
    </div>
  );
};

export default DigitalizationTeam;
