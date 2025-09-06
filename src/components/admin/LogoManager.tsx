import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBrandLogos } from '@/hooks/useBrandLogos';
import { toast } from 'sonner';

interface LogoManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogoManager = ({ isOpen, onClose }: LogoManagerProps) => {
  const { logos, loading, refetch, insertDefaultLogo } = useBrandLogos();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
      // Create preview URL for the first selected file
      const previewUrl = URL.createObjectURL(files[0]);
      setPreviewUrl(previewUrl);
    }
  };

  const uploadLogo = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Please select a logo file first');
      return;
    }

    try {
      setUploading(true);
      const file = selectedFiles[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('department-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('department-images')
        .getPublicUrl(filePath);

      // Insert logo record into database
      const { error: insertError } = await supabase
        .from('brand_logos')
        .insert([{
          name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
          image_url: data.publicUrl,
          is_active: true,
          display_order: logos.length + 1
        }]);

      if (insertError) {
        throw insertError;
      }

      toast.success('Logo uploaded successfully');
      setSelectedFiles(null);
      setPreviewUrl(null);
      refetch();
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const deleteLogo = async (logoId: string, imageUrl: string) => {
    try {
      // Delete from database
      const { error: deleteError } = await supabase
        .from('brand_logos')
        .delete()
        .eq('id', logoId);

      if (deleteError) {
        throw deleteError;
      }

      // Try to delete from storage if it's not a fallback image
      if (imageUrl.includes('supabase')) {
        const imagePath = imageUrl.split('/').pop();
        if (imagePath) {
          await supabase.storage
            .from('department-images')
            .remove([`logos/${imagePath}`]);
        }
      }

      toast.success('Logo deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting logo:', error);
      toast.error('Failed to delete logo');
    }
  };

  const insertDefaultImages = async () => {
    await insertDefaultLogo();
    toast.success('Default logo inserted');
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Logo Manager
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Logo Manager
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-border rounded-lg p-6">
            <div className="text-center space-y-4">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
              <div>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <span className="text-sm font-medium">Upload Logo</span>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 10MB
                </p>
              </div>
              
              {previewUrl && (
                <div className="mt-4">
                  <img 
                    src={previewUrl} 
                    alt="Logo preview" 
                    className="max-w-32 max-h-32 object-contain mx-auto border rounded"
                  />
                </div>
              )}

              <div className="flex gap-2 justify-center">
                <Button
                  onClick={uploadLogo}
                  disabled={!selectedFiles || uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </Button>
                
                {logos.length === 0 && (
                  <Button variant="outline" onClick={insertDefaultImages}>
                    Insert Default Logo
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Current Logos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Current Logo</h3>
            
            {logos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {logos.map((logo) => (
                  <div key={logo.id} className="border rounded-lg p-4 space-y-3">
                    <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={logo.image_url}
                        alt={logo.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          console.log('Logo failed to load:', e.currentTarget.src);
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="font-medium text-sm truncate">{logo.name}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteLogo(logo.id, logo.image_url)}
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No logos found</p>
                <Button 
                  variant="outline" 
                  onClick={insertDefaultImages}
                  className="mt-3"
                >
                  Insert Default Logo
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogoManager;