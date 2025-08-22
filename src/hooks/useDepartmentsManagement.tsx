
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Department } from '@/types/admin';

export const useDepartmentsManagement = (isAdmin: boolean, isVerifyingAdmin: boolean) => {
  const [departments, setDepartments] = useState<Department[]>([]);

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments...');
      const { data, error } = await supabase
        .from('departments')
        .select('code, name')
        .order('name');
      
      if (error) throw error;
      console.log('Fetched departments:', data);
      setDepartments(data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  useEffect(() => {
    if (isAdmin && !isVerifyingAdmin) {
      console.log('Admin verified, fetching departments...');
      fetchDepartments();
    }
  }, [isAdmin, isVerifyingAdmin]);

  return {
    departments,
    fetchDepartments
  };
};
