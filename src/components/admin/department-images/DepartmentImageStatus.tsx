
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface DepartmentImageStatusProps {
  hasImage: boolean;
  departmentCode: string;
  isADM: boolean;
}

const DepartmentImageStatus = ({ hasImage, departmentCode, isADM }: DepartmentImageStatusProps) => {
  if (hasImage) {
    return (
      <Badge 
        variant="secondary" 
        className={`w-full justify-center text-xs ${
          isADM 
            ? 'bg-blue-100 text-blue-700 border-blue-200' 
            : 'bg-green-50 text-green-700 border-green-200'
        }`}
      >
        <Check className="w-3 h-3 mr-1" />
        Active PNG - Visible to ALL {departmentCode} Admin Users
        {isADM && ' Globally'}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="w-full justify-center text-xs text-gray-500">
      No PNG Image - Using Department Code
    </Badge>
  );
};

export default DepartmentImageStatus;
