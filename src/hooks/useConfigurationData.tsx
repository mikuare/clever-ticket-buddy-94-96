
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Classification {
  id: string;
  name: string;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  classification_id: string;
  is_active: boolean;
}

export interface Module {
  id: string;
  name: string;
  is_active: boolean;
}

export const useConfigurationData = () => {
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
    
    // Set up real-time subscriptions
    const classificationsChannel = supabase
      .channel('config-classifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_classifications'
        },
        () => {
          fetchClassifications();
        }
      )
      .subscribe();

    const categoriesChannel = supabase
      .channel('config-categories')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_categories'
        },
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    const modulesChannel = supabase
      .channel('config-modules')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'acumatica_modules'
        },
        () => {
          fetchModules();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(classificationsChannel);
      supabase.removeChannel(categoriesChannel);
      supabase.removeChannel(modulesChannel);
    };
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchClassifications(),
      fetchCategories(),
      fetchModules()
    ]);
    setLoading(false);
  };

  const fetchClassifications = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_classifications')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setClassifications(data || []);
    } catch (error) {
      console.error('Error fetching classifications:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from('acumatica_modules')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const getCategoriesForClassification = (classificationId: string) => {
    return categories.filter(cat => cat.classification_id === classificationId);
  };

  const getClassificationByName = (name: string) => {
    return classifications.find(c => c.name === name);
  };

  return {
    classifications,
    categories,
    modules,
    loading,
    getCategoriesForClassification,
    getClassificationByName
  };
};
