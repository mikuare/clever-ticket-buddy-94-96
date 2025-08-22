import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BrandLogo {
  id: string;
  name: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useBrandLogos = () => {
  const [logos, setLogos] = useState<BrandLogo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBrandLogos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('brand_logos')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching brand logos:', error);
        // Fallback to hardcoded logo
        setLogos([{
          id: 'fallback',
          name: 'QMAZ Holdings Logo',
          image_url: '/lovable-uploads/cb6eca2d-a768-478b-af7f-1c3fba8f1b6c.png',
          is_active: true,
          display_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      } else {
        setLogos(data || []);
      }
    } catch (error) {
      console.error('Error in fetchBrandLogos:', error);
      // Fallback to hardcoded logo
      setLogos([{
        id: 'fallback',
        name: 'QMAZ Holdings Logo',
        image_url: '/lovable-uploads/cb6eca2d-a768-478b-af7f-1c3fba8f1b6c.png',
        is_active: true,
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const insertDefaultLogo = async () => {
    try {
      const { error } = await supabase
        .from('brand_logos')
        .insert([{
          name: 'QMAZ Holdings Logo',
          image_url: '/lovable-uploads/cb6eca2d-a768-478b-af7f-1c3fba8f1b6c.png',
          is_active: true,
          display_order: 1
        }]);

      if (error) {
        console.error('Error inserting default logo:', error);
      } else {
        console.log('Default logo inserted successfully');
        await fetchBrandLogos();
      }
    } catch (error) {
      console.error('Error in insertDefaultLogo:', error);
    }
  };

  useEffect(() => {
    fetchBrandLogos();
  }, []);

  return {
    logos,
    loading,
    insertDefaultLogo,
    refetch: fetchBrandLogos
  };
};