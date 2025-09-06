
import { Card, CardContent } from '@/components/ui/card';
import { Users, Building2, AlertTriangle } from 'lucide-react';

interface DepartmentStats {
  userCount: number;
  adminCount: number;
  suspendedCount: number;
}

interface DepartmentUsersSummaryCardsProps {
  departmentStats: DepartmentStats[];
}

const DepartmentUsersSummaryCards = ({ departmentStats }: DepartmentUsersSummaryCardsProps) => {
  const totalUsers = departmentStats.reduce((sum, stat) => sum + stat.userCount, 0);
  const totalAdmins = departmentStats.reduce((sum, stat) => sum + stat.adminCount, 0);
  const totalSuspended = departmentStats.reduce((sum, stat) => sum + stat.suspendedCount, 0);
  const activeDepartments = departmentStats.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-blue-900">{totalUsers}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Active Departments</p>
              <p className="text-2xl font-bold text-green-900">{activeDepartments}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Admins</p>
              <p className="text-2xl font-bold text-purple-900">{totalAdmins}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Suspended Users</p>
              <p className="text-2xl font-bold text-red-900">{totalSuspended}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentUsersSummaryCards;
