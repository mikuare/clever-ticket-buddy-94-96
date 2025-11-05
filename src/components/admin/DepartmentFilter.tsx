
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useRealTimeUserPresence } from '@/hooks/useRealTimeUserPresence';
import { supabase } from '@/integrations/supabase/client';
import DepartmentAvatar from '@/components/shared/DepartmentAvatar';
import type { Department } from '@/types/admin';

interface DepartmentWithImage extends Department {
  image_url?: string;
}

interface DepartmentFilterProps {
  departments: Department[];
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  ticketMessageCounts?: Map<string, number>;
}

const DepartmentFilter = ({ departments, selectedDepartment, onDepartmentChange, ticketMessageCounts = new Map() }: DepartmentFilterProps) => {
  const { getUsersByDepartment, allUsers } = useRealTimeUserPresence();
  const [departmentsWithImages, setDepartmentsWithImages] = useState<DepartmentWithImage[]>([]);

  useEffect(() => {
    const fetchDepartmentImages = async () => {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('code, name, image_url')
          .in('code', departments.map(d => d.code));

        if (error) throw error;

        setDepartmentsWithImages(data || []);
      } catch (error) {
        console.error('Error fetching department images:', error);
        // Fallback to original departments without images
        setDepartmentsWithImages(departments.map(dept => ({ ...dept, image_url: undefined })));
      }
    };

    if (departments.length > 0) {
      fetchDepartmentImages();
    }
  }, [departments]);

  // Get user count per department
  const getDepartmentUserCount = (departmentCode: string) => {
    const departmentUsers = getUsersByDepartment(departmentCode);
    return departmentUsers.length;
  };

  // Calculate total users across all departments
  const getTotalUserCount = () => {
    return allUsers.length;
  };

  return (
    <div className="mb-6">
      <div className="flex gap-4 items-center">
        <Label htmlFor="dept-filter" className="text-foreground font-medium">Filter by Department:</Label>
        <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
          <SelectTrigger className="w-64 bg-background border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            <SelectItem value="all" className="flex items-center justify-between cursor-pointer">
              <span>All Departments</span>
              {getTotalUserCount() > 0 && (
                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                  {getTotalUserCount()} users
                </Badge>
              )}
            </SelectItem>
            {departmentsWithImages.map((dept) => {
              const userCount = getDepartmentUserCount(dept.code);
              return (
                <SelectItem key={dept.code} value={dept.code} className="flex items-center justify-between cursor-pointer py-3">
                  <div className="flex items-center gap-3">
                    <DepartmentAvatar
                      departmentCode={dept.code}
                      departmentName={dept.name}
                      imageUrl={dept.image_url}
                      size="sm"
                      showOriginalFormat={true}
                    />
                    <span>{dept.code} - {dept.name}</span>
                  </div>
                  {userCount > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                      {userCount} user{userCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DepartmentFilter;
