
import { Card, CardContent } from '@/components/ui/card';

const DepartmentImagesLoading = () => {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading department images...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DepartmentImagesLoading;
