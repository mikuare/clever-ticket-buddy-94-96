
import DepartmentAvatar from '@/components/shared/DepartmentAvatar';
import type { Department } from '@/types/admin';
import { useDepartmentImageUpload } from './hooks/useDepartmentImageUpload';
import DepartmentImagePreview from './DepartmentImagePreview';
import DepartmentImageActions from './DepartmentImageActions';
import DepartmentImageStatus from './DepartmentImageStatus';

interface DepartmentWithImage extends Department {
  image_url?: string;
}

interface DepartmentImageCardProps {
  department: DepartmentWithImage;
  uploading: string | null;
  onUploadStart: (departmentCode: string) => void;
  onUploadComplete: () => void;
  onPreviewImage: (imageUrl: string) => void;
}

const DepartmentImageCard = ({
  department,
  uploading,
  onUploadStart,
  onUploadComplete,
  onPreviewImage
}: DepartmentImageCardProps) => {
  const { uploading: isUploading, handleImageUpload, handleRemoveImage } = useDepartmentImageUpload({
    department,
    onUploadComplete
  });

  // Update parent state when upload status changes
  const currentlyUploading = isUploading ? department.code : '';
  if (currentlyUploading !== uploading && isUploading) {
    onUploadStart(department.code);
  } else if (!isUploading && uploading === department.code) {
    onUploadStart('');
  }

  // Special styling for ADM department
  const isADM = department.code === 'ADM';

  return (
    <div className={`p-4 border rounded-lg bg-card hover:bg-muted/50 transition-all duration-200 ${isADM ? 'border-blue-200 bg-blue-50/30' : ''}`}>
      <div className="flex items-center gap-3 mb-4">
        <DepartmentAvatar
          departmentCode={department.code}
          departmentName={department.name}
          imageUrl={department.image_url}
          size="md"
          showOriginalFormat={true}
        />
        <div className="flex-1">
          <h3 className={`font-medium ${isADM ? 'text-blue-900' : 'text-gray-900'}`}>
            {department.name}
            {isADM && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">ADMIN</span>}
          </h3>
          <p className="text-sm text-gray-500">{department.code}</p>
          {department.image_url && (
            <p className={`text-xs mt-1 ${isADM ? 'text-blue-600' : 'text-green-600'}`}>
              ✓ PNG active & visible to ALL admin users globally
              {isADM && ' (Including all ADM administrators)'}
            </p>
          )}
        </div>
      </div>

      {department.image_url && (
        <DepartmentImagePreview
          imageUrl={department.image_url}
          departmentCode={department.code}
          departmentName={department.name}
          isADM={isADM}
          onPreviewImage={onPreviewImage}
        />
      )}

      <DepartmentImageActions
        departmentCode={department.code}
        hasImage={!!department.image_url}
        uploading={isUploading}
        isADM={isADM}
        onFileSelect={handleImageUpload}
        onRemoveImage={handleRemoveImage}
      />

      <DepartmentImageStatus
        hasImage={!!department.image_url}
        departmentCode={department.code}
        isADM={isADM}
      />
    </div>
  );
};

export default DepartmentImageCard;
