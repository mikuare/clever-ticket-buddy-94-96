
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BrandingImage {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  image_type: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useBrandingImages = () => {
  const [images, setImages] = useState<BrandingImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrandingImages();
  }, []);

  const fetchBrandingImages = async () => {
    try {
      const { data, error } = await supabase
        .from('branding_images')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching branding images:', error);
        // Fallback to existing hardcoded images
        setImages([
          {
            id: '1',
            name: 'Background 1',
            image_url: '/lovable-uploads/cceef45f-bf3d-4bc5-9651-70397108a146.png',
            image_type: 'background',
            is_active: true,
            display_order: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Background 2',
            image_url: '/lovable-uploads/bbcaed06-9a97-41a7-b55f-7e09c6b998df.png',
            image_type: 'background',
            is_active: true,
            display_order: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Background 3',
            image_url: '/lovable-uploads/3ebb3991-5797-49d3-bbbe-d35d0beb24b3.png',
            image_type: 'background',
            is_active: true,
            display_order: 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '4',
            name: 'Background 4',
            image_url: '/lovable-uploads/0268d849-61ca-43f1-a6ed-69265d9c5ae9.png',
            image_type: 'background',
            is_active: true,
            display_order: 4,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      } else {
        setImages(data || []);
      }
    } catch (error) {
      console.error('Error fetching branding images:', error);
    } finally {
      setLoading(false);
    }
  };

  const insertBrandingImages = async () => {
    const imagesToInsert = [
      {
        name: 'QMAZ Logo',
        description: 'Main QMAZ Holdings logo',
        image_url: '/lovable-uploads/cb6eca2d-a768-478b-af7f-1c3fba8f1b6c.png',
        image_type: 'logo',
        display_order: 0
      },
      {
        name: 'Background Image 1',
        description: 'Slideshow background image 1',
        image_url: '/lovable-uploads/cceef45f-bf3d-4bc5-9651-70397108a146.png',
        image_type: 'background',
        display_order: 1
      },
      {
        name: 'Background Image 2',
        description: 'Slideshow background image 2',
        image_url: '/lovable-uploads/bbcaed06-9a97-41a7-b55f-7e09c6b998df.png',
        image_type: 'background',
        display_order: 2
      },
      {
        name: 'Background Image 3',
        description: 'Slideshow background image 3',
        image_url: '/lovable-uploads/3ebb3991-5797-49d3-bbbe-d35d0beb24b3.png',
        image_type: 'background',
        display_order: 3
      },
      {
        name: 'Background Image 4',
        description: 'Slideshow background image 4',
        image_url: '/lovable-uploads/0268d849-61ca-43f1-a6ed-69265d9c5ae9.png',
        image_type: 'background',
        display_order: 4
      }
    ];

    try {
      const { data, error } = await supabase
        .from('branding_images')
        .insert(imagesToInsert)
        .select();

      if (error) {
        console.error('Error inserting branding images:', error);
        return false;
      }

      console.log('Successfully inserted branding images:', data);
      await fetchBrandingImages(); // Refresh the images
      return true;
    } catch (error) {
      console.error('Error inserting branding images:', error);
      return false;
    }
  };

  return {
    images,
    loading,
    insertBrandingImages,
    refetch: fetchBrandingImages
  };
};
