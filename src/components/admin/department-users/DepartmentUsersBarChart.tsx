
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface DepartmentStats {
  department: { code: string; name: string };
  userCount: number;
  adminCount: number;
  suspendedCount: number;
}

interface DepartmentUsersBarChartProps {
  departmentStats: DepartmentStats[];
}

const DepartmentUsersBarChart = ({ departmentStats }: DepartmentUsersBarChartProps) => {
  const barChartData = departmentStats.map(stat => ({
    department: stat.department.code,
    users: stat.userCount,
    admins: stat.adminCount,
    suspended: stat.suspendedCount
  }));

  const chartConfig = {
    users: {
      label: "Total Users",
      color: "#3b82f6",
    },
    admins: {
      label: "Admins",
      color: "#10b981",
    },
    suspended: {
      label: "Suspended",
      color: "#ef4444",
    },
  };

  if (barChartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users, Admins & Suspended by Department</CardTitle>
          <CardDescription>
            Comparison of total users, admin users, and suspended users per department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No department data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users, Admins & Suspended by Department</CardTitle>
        <CardDescription>
          Comparison of total users, admin users, and suspended users per department
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData}>
              <XAxis dataKey="department" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="users" fill="#3b82f6" name="Total Users" />
              <Bar dataKey="admins" fill="#10b981" name="Admins" />
              <Bar dataKey="suspended" fill="#ef4444" name="Suspended" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default DepartmentUsersBarChart;
