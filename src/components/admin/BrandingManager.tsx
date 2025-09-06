import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useBrandingImages } from '@/hooks/useBrandingImages';
import { Upload, Trash2, Eye, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BrandingManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BrandingImage {
  id: string;
  name: string;
  image_url: string;
  image_type: string;
  display_order: number;
  is_active: boolean;
}

interface SortableImageItemProps {
  image: BrandingImage;
  onPreview: (url: string) => void;
  onDelete: (id: string, url: string) => void;
}

const SortableImageItem = ({ image, onPreview, onDelete }: SortableImageItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group bg-card rounded-lg border"
    >
      <div className="absolute top-2 left-2 z-10">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 bg-background/80 rounded hover:bg-background transition-colors"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
        <img
          src={image.image_url}
          alt={image.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onPreview(image.image_url)}
          className="flex items-center gap-1"
        >
          <Eye className="h-4 w-4" />
          Preview
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(image.id, image.image_url)}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
      <p className="mt-2 px-2 pb-2 text-sm text-center truncate">{image.name}</p>
      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
        {image.display_order + 1}
      </div>
    </div>
  );
};

const BrandingManager = ({ isOpen, onClose }: BrandingManagerProps) => {
  const { images, loading, insertBrandingImages, refetch } = useBrandingImages();
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const backgroundImages = images.filter(img => img.image_type === 'background')
    .sort((a, b) => a.display_order - b.display_order);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const uploadImages = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Please select images to upload');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file, index) => {
        // Upload to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `branding-${Date.now()}-${index}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('department-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('department-images')
          .getPublicUrl(fileName);

        // Insert into database
        const { error: dbError } = await supabase
          .from('branding_images')
          .insert({
            name: `Background Image ${index + 1}`,
            image_url: publicUrl,
            image_type: 'background',
            display_order: backgroundImages.length + index,
            is_active: true
          });

        if (dbError) throw dbError;
      });

      await Promise.all(uploadPromises);
      toast.success('Images uploaded successfully!');
      refetch();
      setSelectedFiles(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId: string, imageUrl: string) => {
    try {
      // Extract filename from URL
      const fileName = imageUrl.split('/').pop();
      
      // Delete from storage
      if (fileName) {
        await supabase.storage
          .from('department-images')
          .remove([fileName]);
      }

      // Delete from database
      const { error } = await supabase
        .from('branding_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast.success('Image deleted successfully!');
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image');
    }
  };

  const insertDefaultImages = async () => {
    try {
      await insertBrandingImages();
      toast.success('Default images inserted successfully!');
    } catch (error) {
      console.error('Insert error:', error);
      toast.error('Failed to insert default images');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = backgroundImages.findIndex((item) => item.id === active.id);
      const newIndex = backgroundImages.findIndex((item) => item.id === over?.id);

      const reorderedItems = arrayMove(backgroundImages, oldIndex, newIndex);
      
      try {
        // Update display_order for all affected items
        const updatePromises = reorderedItems.map((item, index) => 
          supabase
            .from('branding_images')
            .update({ display_order: index })
            .eq('id', item.id)
        );

        await Promise.all(updatePromises);
        toast.success('Image order updated successfully!');
        refetch();
      } catch (error) {
        console.error('Reorder error:', error);
        toast.error('Failed to update image order');
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Branding Slideshow Images</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Upload Section */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Label htmlFor="imageUpload">Upload New Images</Label>
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={uploadImages} 
                      disabled={uploading || !selectedFiles}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {uploading ? 'Uploading...' : 'Upload Images'}
                    </Button>
                    {backgroundImages.length === 0 && (
                      <Button 
                        onClick={insertDefaultImages} 
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        Insert Default Images
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Images */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Current Slideshow Images</h3>
                {loading ? (
                  <div className="text-center py-8">Loading images...</div>
                ) : backgroundImages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No slideshow images found. Upload some images or insert default ones.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Drag and drop images to reorder the slideshow sequence. The number indicates display order.
                    </p>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={backgroundImages.map(img => img.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {backgroundImages.map((image) => (
                            <SortableImageItem
                              key={image.id}
                              image={image}
                              onPreview={setPreviewImage}
                              onDelete={deleteImage}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Image Preview</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default BrandingManager;