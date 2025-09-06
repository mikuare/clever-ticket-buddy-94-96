import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ITTeamMember {
  id: string;
  name: string;
  image_url: string;
  job_title: string;
  display_order: number;
  is_active: boolean;
}

export const useITTeam = () => {
  const [teamMembers, setTeamMembers] = useState<ITTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('it_team')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching IT team members:', error);
      toast({
        title: "Error",
        description: "Failed to fetch IT team members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTeamMember = async (id: string, updates: Partial<ITTeamMember>) => {
    try {
      const { error } = await supabase
        .from('it_team')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setTeamMembers(prev => 
        prev.map(member => 
          member.id === id ? { ...member, ...updates } : member
        )
      );

      toast({
        title: "Success",
        description: "IT team member updated successfully",
      });
    } catch (error) {
      console.error('Error updating IT team member:', error);
      toast({
        title: "Error",
        description: "Failed to update IT team member",
        variant: "destructive",
      });
    }
  };

  const uploadImage = async (file: File, memberId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${memberId}-${Date.now()}.${fileExt}`;
      const filePath = `it-team-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('digitalization-team-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('digitalization-team-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('it_team_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'it_team'
        },
        (payload) => {
          console.log('IT team member changed:', payload);
          fetchTeamMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    teamMembers,
    loading,
    updateTeamMember,
    uploadImage,
    refreshTeamMembers: fetchTeamMembers
  };
};