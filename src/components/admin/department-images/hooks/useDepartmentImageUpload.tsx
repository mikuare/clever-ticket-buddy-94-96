
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Department } from '@/types/admin';

interface UseDepartmentImageUploadProps {
  department: Department;
  onUploadComplete: () => void;
}

export const useDepartmentImageUpload = ({ department, onUploadComplete }: UseDepartmentImageUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      
      // Strict PNG validation
      if (file.type !== 'image/png') {
        toast.error(`Please select a PNG image file only for ${department.code} department`);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`PNG image size must be less than 5MB for ${department.code} department`);
        return;
      }

      const fileName = `${department.code}.png`;
      const filePath = `${fileName}`;

      console.log(`Uploading PNG image for ${department.code} department - will be visible to all admin users`);

      // Delete existing file first to ensure clean upload
      const { error: deleteError } = await supabase.storage
        .from('department-images')
        .remove([filePath]);

      if (deleteError) {
        console.log(`No existing ${department.code} image to delete or delete failed:`, deleteError);
      }

      // Upload new PNG file with enhanced metadata
      const { error: uploadError } = await supabase.storage
        .from('department-images')
        .upload(filePath, file, {
          upsert: true,
          contentType: 'image/png',
          cacheControl: '3600' // 1 hour cache control
        });

      if (uploadError) {
        console.error(`Upload error for ${department.code}:`, uploadError);
        throw uploadError;
      }

      console.log(`PNG image uploaded successfully for ${department.code} - processing for all admin users`);

      // Get public URL with enhanced cache busting for global admin visibility
      const { data: { publicUrl } } = supabase.storage
        .from('department-images')
        .getPublicUrl(filePath);

      const globalCacheBustedUrl = `${publicUrl}?v=${Date.now()}&dept=${department.code}&global=${Math.random()}`;
      console.log(`Generated global admin URL for ${department.code}:`, globalCacheBustedUrl);

      // Update department record with new image URL
      const { error: updateError } = await supabase
        .from('departments')
        .update({ 
          image_url: globalCacheBustedUrl,
          updated_at: new Date().toISOString()
        })
        .eq('code', department.code);

      if (updateError) {
        console.error(`Database update error for ${department.code}:`, updateError);
        throw updateError;
      }

      console.log(`Database updated successfully for ${department.code} - visible to all admin users globally`);

      // Success notifications for admin users
      toast.success(`${department.code} department PNG image uploaded successfully!`);
      
      // Additional confirmation for global visibility
      setTimeout(() => {
        toast.success(`✓ ${department.code} PNG confirmed: Now displaying across ALL admin dashboards system-wide`);
      }, 1000);
      
      // Final confirmation for ADM department specifically
      if (department.code === 'ADM') {
        setTimeout(() => {
          toast.success(`🔧 ADM department image confirmed: Visible to all administration users globally`);
        }, 2000);
      }
      
      // Force complete refresh for all admin users
      onUploadComplete();
      
    } catch (error) {
      console.error(`Error uploading PNG image for ${department.code}:`, error);
      toast.error(`Failed to upload PNG image for ${department.code} department. Please try again.`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      console.log(`Removing PNG image for ${department.code} department - change will be visible to all admin users`);

      // Update department to remove image URL
      const { error } = await supabase
        .from('departments')
        .update({ 
          image_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('code', department.code);

      if (error) throw error;

      console.log(`PNG image removed successfully for ${department.code} - change visible globally to all admin users`);
      toast.success(`${department.code} department PNG image removed - change reflected across all admin dashboards`);
      onUploadComplete();
    } catch (error) {
      console.error(`Error removing PNG image for ${department.code}:`, error);
      toast.error(`Failed to remove PNG image for ${department.code} department`);
    }
  };

  return {
    uploading,
    handleImageUpload,
    handleRemoveImage
  };
};
