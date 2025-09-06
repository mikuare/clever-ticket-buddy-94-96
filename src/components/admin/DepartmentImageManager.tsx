
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Department } from '@/types/admin';
import DepartmentImageCard from './department-images/DepartmentImageCard';
import ImagePreviewModal from './department-images/ImagePreviewModal';
import DepartmentImagesLoading from './department-images/DepartmentImagesLoading';

interface DepartmentImageManagerProps {
  departments: Department[];
  onRefresh: () => void;
}

interface DepartmentWithImage extends Department {
  image_url?: string;
  updated_at?: string;
}

const DepartmentImageManager = ({ departments, onRefresh }: DepartmentImageManagerProps) => {
  const [departmentsWithImages, setDepartmentsWithImages] = useState<DepartmentWithImage[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchDepartmentImages = async () => {
    try {
      setLoading(true);
      console.log('Fetching department images with fresh data...');
      
      // Force fresh data by adding cache-busting timestamp
      const { data, error } = await supabase
        .from('departments')
        .select('code, name, image_url, updated_at')
        .order('name');

      if (error) {
        console.error('Error fetching department images:', error);
        throw error;
      }

      console.log('Fresh departments data fetched:', data);
      
      // Process image URLs with enhanced cache busting for all admin users
      const processedData = data?.map(dept => ({
        ...dept,
        image_url: dept.image_url ? `${dept.image_url}?refresh=${Date.now()}&key=${refreshKey}` : undefined
      })) || [];
      
      setDepartmentsWithImages(processedData);
      console.log('Processed departments with enhanced cache busting:', processedData);
    } catch (error) {
      console.error('Error fetching department images:', error);
      toast.error('Failed to load department images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('DepartmentImageManager: Initial load or departments updated');
    fetchDepartmentImages();

    // Enhanced real-time subscription for all admin users
    const channel = supabase
      .channel('department-images-global-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'departments'
        },
        (payload) => {
          console.log('Real-time department update received:', payload);
          const updatedDept = payload.new as any;
          
          // Force immediate refresh for all admin users
          setRefreshKey(prev => prev + 1);
          fetchDepartmentImages();
          
          // Notify all admin users about the update
          if (updatedDept.image_url) {
            toast.success(`${updatedDept.code} department PNG image updated - now visible to all admin users`);
          } else {
            toast.info(`${updatedDept.code} department image removed - change visible to all admin users`);
          }
        }
      )
      .subscribe((status) => {
        console.log('Department images subscription status:', status);
      });

    return () => {
      console.log('Cleaning up department images subscription');
      supabase.removeChannel(channel);
    };
  }, [departments, refreshKey]);

  const handleUploadStart = (departmentCode: string) => {
    console.log(`Upload started for ${departmentCode} department - will be visible to all admin users`);
    setUploading(departmentCode);
  };

  const handleUploadComplete = async () => {
    console.log('Upload completed - forcing global refresh for all admin users...');
    setUploading(null);
    
    // Multiple refresh strategies to ensure all admin users see the update
    setRefreshKey(prev => prev + 1);
    
    // Immediate refresh
    await fetchDepartmentImages();
    
    // Trigger parent component refresh
    onRefresh();
    
    // Secondary refresh after short delay for network propagation
    setTimeout(async () => {
      console.log('Secondary refresh for all admin users...');
      setRefreshKey(prev => prev + 1);
      await fetchDepartmentImages();
      onRefresh();
    }, 1500);
    
    // Final refresh to ensure consistency across all admin dashboards
    setTimeout(async () => {
      console.log('Final consistency check for all admin users...');
      await fetchDepartmentImages();
    }, 3000);
  };

  const handlePreviewImage = (imageUrl: string) => {
    // Remove cache busting params for preview
    const cleanUrl = imageUrl.split('?')[0];
    setPreviewImage(`${cleanUrl}?preview=${Date.now()}`);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  if (loading) {
    return <DepartmentImagesLoading />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Department Profile Images (PNG Only) - Global Admin View
          </CardTitle>
          <CardDescription>
            Upload and manage PNG profile images for each department. Only PNG format is accepted to ensure uniform quality and compatibility. 
            Images will be displayed consistently across ALL admin dashboards, including the ADM department. 
            All administrators in the same department will see the updated image immediately with real-time synchronization.
            This ensures transparent and accurate departmental representation throughout the entire system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departmentsWithImages.map((dept) => (
              <DepartmentImageCard
                key={`${dept.code}-${dept.image_url || 'no-image'}-${dept.updated_at}-${refreshKey}`}
                department={dept}
                uploading={uploading}
                onUploadStart={handleUploadStart}
                onUploadComplete={handleUploadComplete}
                onPreviewImage={handlePreviewImage}
              />
            ))}
          </div>
          
          {departmentsWithImages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No departments found. Please contact system administrator.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ImagePreviewModal
        imageUrl={previewImage}
        onClose={handleClosePreview}
      />
    </>
  );
};

export default DepartmentImageManager;
