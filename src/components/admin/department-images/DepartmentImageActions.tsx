
import { Button } from '@/components/ui/button';
import { Upload, X, RefreshCw } from 'lucide-react';

interface DepartmentImageActionsProps {
  departmentCode: string;
  hasImage: boolean;
  uploading: boolean;
  isADM: boolean;
  onFileSelect: (file: File) => void;
  onRemoveImage: () => void;
}

const DepartmentImageActions = ({
  departmentCode,
  hasImage,
  uploading,
  isADM,
  onFileSelect,
  onRemoveImage
}: DepartmentImageActionsProps) => {
  return (
    <div className="flex items-center gap-2 mb-3">
      <input
        type="file"
        accept="image/png"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onFileSelect(file);
          }
        }}
        className="hidden"
        id={`upload-${departmentCode}`}
        disabled={uploading}
      />
      <label
        htmlFor={`upload-${departmentCode}`}
        className={`flex-1 cursor-pointer ${uploading ? 'pointer-events-none' : ''}`}
      >
        <Button
          variant="outline"
          size="sm"
          className={`w-full ${isADM ? 'border-blue-300 hover:bg-blue-50' : ''}`}
          disabled={uploading}
          asChild
        >
          <span>
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Uploading PNG...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {hasImage ? 'Replace PNG Image' : 'Upload PNG Image'}
              </>
            )}
          </span>
        </Button>
      </label>

      {hasImage && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRemoveImage}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default DepartmentImageActions;
