
import { PieChart, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon } from 'lucide-react';

interface DepartmentStats {
  department: { code: string; name: string };
  userCount: number;
}

interface DepartmentUsersPieChartProps {
  departmentStats: DepartmentStats[];
}

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
];

const DepartmentUsersPieChart = ({ departmentStats }: DepartmentUsersPieChartProps) => {
  const pieChartData = departmentStats.map((stat, index) => ({
    name: stat.department.name,
    value: stat.userCount,
    fill: CHART_COLORS[index % CHART_COLORS.length]
  }));

  const chartConfig = {
    value: {
      label: "Users",
    },
  };

  if (pieChartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            User Distribution by Department
          </CardTitle>
          <CardDescription>
            Visual breakdown of users across departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <PieChartIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
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
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="w-5 h-5" />
          User Distribution by Department
        </CardTitle>
        <CardDescription>
          Visual breakdown of users across departments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <PieChart data={pieChartData} cx="50%" cy="50%" outerRadius={80}>
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </PieChart>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default DepartmentUsersPieChart;
