
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ImagePreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

const ImagePreviewModal = ({ imageUrl, onClose }: ImagePreviewModalProps) => {
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="bg-white rounded-lg p-4 max-w-2xl max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Department Image Preview</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <img 
          src={imageUrl} 
          alt="Department preview"
          className="w-full h-auto max-h-96 object-contain border rounded"
        />
        <p className="text-sm text-gray-600 mt-2 text-center">
          Full size preview - This shows how the image will appear in dashboards
        </p>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
