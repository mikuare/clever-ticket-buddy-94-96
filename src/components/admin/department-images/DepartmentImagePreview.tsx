
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface DepartmentImagePreviewProps {
  imageUrl: string;
  departmentCode: string;
  departmentName: string;
  isADM: boolean;
  onPreviewImage: (imageUrl: string) => void;
}

const DepartmentImagePreview = ({
  imageUrl,
  departmentCode,
  departmentName,
  isADM,
  onPreviewImage
}: DepartmentImagePreviewProps) => {
  return (
    <div className={`mb-4 p-3 rounded-lg border ${isADM ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${isADM ? 'text-blue-700' : 'text-gray-700'}`}>
          Current PNG Preview:
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPreviewImage(imageUrl)}
          className={`${isADM ? 'text-blue-600 hover:text-blue-700' : 'text-blue-600 hover:text-blue-700'}`}
        >
          <Eye className="w-4 h-4 mr-1" />
          View Large
        </Button>
      </div>
      <div className="w-full h-16 bg-white border rounded overflow-hidden">
        <img 
          src={imageUrl} 
          alt={`${departmentName} PNG`}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error(`Failed to load ${departmentCode} PNG image:`, imageUrl);
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        This PNG appears in ALL admin dashboards for {departmentCode} department users
        {isADM && ' and across the entire administration system'}
      </p>
    </div>
  );
};

export default DepartmentImagePreview;
