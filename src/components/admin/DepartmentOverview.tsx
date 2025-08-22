
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import type { Department, Ticket } from '@/types/admin';

interface DepartmentOverviewProps {
  departments: Department[];
  tickets: Ticket[];
  onDepartmentClick: (departmentCode: string) => void;
}

const DepartmentOverview = ({ departments, tickets, onDepartmentClick }: DepartmentOverviewProps) => {
  const getDepartmentTickets = (deptCode: string) => {
    return tickets.filter(ticket => ticket.department_code === deptCode);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Department Overview
        </CardTitle>
        <CardDescription>Real-time ticket status across all departments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {departments.map((dept) => {
            const deptTickets = getDepartmentTickets(dept.code);
            const openTickets = deptTickets.filter(t => t.status === 'Open').length;
            
            return (
              <div
                key={dept.code}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onDepartmentClick(dept.code)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{dept.code}</h3>
                    <p className="text-sm text-gray-600 mt-1">{dept.name}</p>
                  </div>
                  {openTickets > 0 && (
                    <Badge className="bg-red-500 text-white">
                      {openTickets}
                    </Badge>
                  )}
                </div>
                <div className="mt-3 text-sm text-gray-500">
                  {deptTickets.length} total tickets
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DepartmentOverview;
