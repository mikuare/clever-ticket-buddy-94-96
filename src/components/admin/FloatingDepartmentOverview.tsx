

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, X, Users, Clock, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Ticket, Department } from '@/types/admin';
import { useDepartmentsManagement } from '@/hooks/useDepartmentsManagement';
import { useNotificationsManagement } from '@/hooks/useNotificationsManagement';

interface FloatingDepartmentOverviewProps {
  tickets: Ticket[];
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#6b7280'];

const FloatingDepartmentOverview = ({ tickets }: FloatingDepartmentOverviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { departments } = useDepartmentsManagement(true, false);
  const { departmentNotifications, userNotifications } = useNotificationsManagement(tickets, departments);

  const handleClose = () => {
    setIsOpen(false);
  };

  // Prepare data for overall pie chart
  const overallStats = {
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
    closed: tickets.filter(t => t.status === 'Closed').length,
  };

  const pieData = [
    { name: 'Open', value: overallStats.open, color: '#ef4444' },
    { name: 'In Progress', value: overallStats.inProgress, color: '#f59e0b' },
    { name: 'Resolved', value: overallStats.resolved, color: '#10b981' },
    { name: 'Closed', value: overallStats.closed, color: '#6b7280' },
  ].filter(item => item.value > 0);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 hover:scale-105"
        title="Department Overview"
      >
        <Building2 className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-7xl max-h-[90vh] overflow-hidden bg-white shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Building2 className="w-6 h-6 text-blue-600" />
            Department Overview
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleClose} className="hover:bg-gray-100">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[75vh] p-6">
          {/* Overall Statistics Pie Chart */}
          {pieData.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-center">Overall Ticket Distribution</h3>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {departments.map((dept) => {
              const deptTickets = tickets.filter(t => t.department_code === dept.code);
              const openTickets = deptTickets.filter(t => t.status === 'Open').length;
              const inProgressTickets = deptTickets.filter(t => t.status === 'In Progress').length;
              const resolvedTickets = deptTickets.filter(t => t.status === 'Resolved').length;
              const closedTickets = deptTickets.filter(t => t.status === 'Closed').length;
              const totalTickets = deptTickets.length;

              // Department pie chart data
              const deptPieData = [
                { name: 'Open', value: openTickets, color: '#ef4444' },
                { name: 'In Progress', value: inProgressTickets, color: '#f59e0b' },
                { name: 'Resolved', value: resolvedTickets, color: '#10b981' },
                { name: 'Closed', value: closedTickets, color: '#6b7280' },
              ].filter(item => item.value > 0);
              
              return (
                <div key={dept.code} className="p-5 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-800">{dept.code}</h3>
                    {totalTickets > 0 && (
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
                        {totalTickets}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 font-medium">{dept.name}</p>
                  
                  {/* Department Mini Pie Chart */}
                  {deptPieData.length > 0 && (
                    <div className="mb-4">
                      <ResponsiveContainer width="100%" height={120}>
                        <PieChart>
                          <Pie
                            data={deptPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={20}
                            outerRadius={40}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {deptPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value} tickets`, name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-red-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Open</span>
                      </span>
                      <span className="font-bold text-red-600">{openTickets}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-yellow-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">In Progress</span>
                      </span>
                      <span className="font-bold text-yellow-600">{inProgressTickets}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Resolved</span>
                      </span>
                      <span className="font-bold text-green-600">{resolvedTickets}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="flex items-center gap-2 text-gray-600">
                        <span className="text-sm font-medium">Closed</span>
                      </span>
                      <span className="font-bold text-gray-600">{closedTickets}</span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  {totalTickets > 0 && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${((resolvedTickets + closedTickets) / totalTickets) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        {Math.round(((resolvedTickets + closedTickets) / totalTickets) * 100)}% Completed
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FloatingDepartmentOverview;

