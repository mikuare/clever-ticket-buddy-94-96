import { useState, useMemo } from 'react';
import { useDigitalizationTeam } from './useDigitalizationTeam';
import { useITTeam } from './useITTeam';
import type { AdminAnalytics } from '@/types/adminAnalytics';
import type { TeamFilterType } from '@/components/admin/analysis/TeamFilter';

export const useTeamFilter = (adminAnalytics: AdminAnalytics[]) => {
  const [selectedTeam, setSelectedTeam] = useState<TeamFilterType>('all');
  const { teamMembers: digitalizationMembers } = useDigitalizationTeam();
  const { teamMembers: itMembers } = useITTeam();

  // Helper function to normalize names for comparison
  const normalizeName = (name: string): string => {
    return name.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  };

  // Helper function to check if names match (with fuzzy matching)
  const isNameMatch = (profileName: string, teamName: string): boolean => {
    const normalizedProfileName = normalizeName(profileName);
    const normalizedTeamName = normalizeName(teamName);
    
    // Exact match
    if (normalizedProfileName === normalizedTeamName) return true;
    
    // Check if team name contains all words from profile name
    const profileWords = normalizedProfileName.split(' ').filter(word => word.length > 1);
    const teamWords = normalizedTeamName.split(' ');
    
    // At least 2 words should match for fuzzy matching
    const matchingWords = profileWords.filter(word => 
      teamWords.some(teamWord => teamWord.includes(word) || word.includes(teamWord))
    );
    
    return matchingWords.length >= Math.min(2, profileWords.length);
  };

  // Categorize admins by team
  const categorizedAdmins = useMemo(() => {
    const digitalizationAdmins: AdminAnalytics[] = [];
    const itAdmins: AdminAnalytics[] = [];
    const unassignedAdmins: AdminAnalytics[] = [];

    adminAnalytics.forEach(admin => {
      let assigned = false;

      // Check if admin belongs to digitalization team
      const isDigitalizationMember = digitalizationMembers.some(member => 
        isNameMatch(admin.admin_name, member.name)
      );

      if (isDigitalizationMember) {
        digitalizationAdmins.push(admin);
        assigned = true;
      }

      // Check if admin belongs to IT team (only if not already assigned)
      if (!assigned) {
        const isITMember = itMembers.some(member => 
          isNameMatch(admin.admin_name, member.name)
        );

        if (isITMember) {
          itAdmins.push(admin);
          assigned = true;
        }
      }

      // If not assigned to any team, add to unassigned
      if (!assigned) {
        unassignedAdmins.push(admin);
      }
    });

    return {
      digitalization: digitalizationAdmins,
      it: itAdmins,
      unassigned: unassignedAdmins
    };
  }, [adminAnalytics, digitalizationMembers, itMembers]);

  // Get filtered admins based on selected team
  const filteredAdmins = useMemo(() => {
    switch (selectedTeam) {
      case 'digitalization':
        return categorizedAdmins.digitalization;
      case 'it':
        return categorizedAdmins.it;
      default:
        return adminAnalytics; // All teams
    }
  }, [selectedTeam, categorizedAdmins, adminAnalytics]);

  return {
    selectedTeam,
    setSelectedTeam,
    filteredAdmins,
    teamCounts: {
      digitalization: categorizedAdmins.digitalization.length,
      it: categorizedAdmins.it.length,
      total: adminAnalytics.length,
      unassigned: categorizedAdmins.unassigned.length
    },
    categorizedAdmins
  };
};