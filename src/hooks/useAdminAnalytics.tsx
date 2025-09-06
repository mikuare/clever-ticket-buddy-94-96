
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AdminAnalytics, AdminSummaryStats } from '@/types/adminAnalytics';

interface UseAdminAnalyticsProps {
  isAdmin: boolean;
  isVerifyingAdmin: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
}

export const useAdminAnalytics = (
  isAdmin: boolean, 
  isVerifyingAdmin: boolean,
  startDate?: Date | null,
  endDate?: Date | null
) => {
  const [adminAnalytics, setAdminAnalytics] = useState<AdminAnalytics[]>([]);
  const [summaryStats, setSummaryStats] = useState<AdminSummaryStats>({
    total_tickets_all_admins: 0,
    total_tickets_in_progress: 0,
    avg_response_time_hours: 0,
    avg_resolution_time_hours: 0,
    total_tickets_escalated_to_dev: 0,
  });

  // Format dates for database function calls
  const formatDateForDb = (date: Date | null) => {
    if (!date) return null;
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  const startDateFormatted = formatDateForDb(startDate);
  const endDateFormatted = formatDateForDb(endDate);

  // Fetch admin analytics data with date filtering
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics', startDateFormatted, endDateFormatted],
    queryFn: async () => {
      console.log('Fetching admin analytics with date range:', { startDateFormatted, endDateFormatted });
      
      const { data, error } = await supabase.rpc('get_admin_analytics_by_date_range', {
        start_date: startDateFormatted,
        end_date: endDateFormatted
      });

      if (error) {
        console.error('Error fetching admin analytics:', error);
        throw error;
      }

      console.log('Admin analytics data received:', data);
      return data as AdminAnalytics[];
    },
    enabled: isAdmin && !isVerifyingAdmin,
    refetchOnWindowFocus: false,
  });

  // Fetch summary statistics with date filtering
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['admin-summary-stats', startDateFormatted, endDateFormatted],
    queryFn: async () => {
      console.log('Fetching admin summary stats with date range:', { startDateFormatted, endDateFormatted });
      
      const { data, error } = await supabase.rpc('get_admin_summary_stats_by_date_range', {
        start_date: startDateFormatted,
        end_date: endDateFormatted
      });

      if (error) {
        console.error('Error fetching admin summary stats:', error);
        throw error;
      }

      console.log('Summary stats data received:', data);
      return data && data.length > 0 ? data[0] as AdminSummaryStats : {
        total_tickets_all_admins: 0,
        total_tickets_in_progress: 0,
        avg_response_time_hours: 0,
        avg_resolution_time_hours: 0,
        total_tickets_escalated_to_dev: 0,
      };
    },
    enabled: isAdmin && !isVerifyingAdmin,
    refetchOnWindowFocus: false,
  });

  // Update state when data changes
  useEffect(() => {
    if (analyticsData) {
      setAdminAnalytics(analyticsData);
    }
  }, [analyticsData]);

  useEffect(() => {
    if (summaryData) {
      setSummaryStats(summaryData);
    }
  }, [summaryData]);

  const loading = analyticsLoading || summaryLoading;

  return {
    adminAnalytics,
    summaryStats,
    loading,
  };
};
