import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Building2, Mail, ArrowLeft, Ban, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSuspension } from '@/hooks/useSuspension';
import SuspensionModal from '@/components/admin/suspension/SuspensionModal';
import UnsuspensionDialog from '@/components/admin/suspension/UnsuspensionDialog';
import DepartmentUsersBarChart from '@/components/admin/department-users/DepartmentUsersBarChart';
import DepartmentUsersSummaryCards from '@/components/admin/department-users/DepartmentUsersSummaryCards';
import type { Department } from '@/types/admin';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  department_code: string;
  is_admin: boolean;
  is_suspended: boolean;
  suspended_at: string | null;
  suspended_by: string | null;
  suspension_reason: string | null;
  created_at: string;
  avatar_url: string | null;
}

interface DepartmentStats {
  department: Department;
  userCount: number;
  adminCount: number;
  suspendedCount: number;
  users: UserProfile[];
}

interface DepartmentUserManagementProps {
  departments: Department[];
}

const DepartmentUserManagement = ({ departments }: DepartmentUserManagementProps) => {
  const [loading, setLoading] = useState(true);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentStats | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'department-detail'>('overview');
  const [filterSuspended, setFilterSuspended] = useState<'all' | 'active' | 'suspended'>('all');
  
  // Suspension modals
  const [suspensionModal, setSuspensionModal] = useState<{
    isOpen: boolean;
    user: UserProfile | null;
  }>({ isOpen: false, user: null });
  
  const [unsuspensionDialog, setUnsuspensionDialog] = useState<{
    isOpen: boolean;
    user: UserProfile | null;
  }>({ isOpen: false, user: null });

  const { suspendUser, unsuspendUser, loading: suspensionLoading } = useSuspension();

  const fetchDepartmentUsers = async () => {
    setLoading(true);
    try {
      console.log('Fetching all users for department analysis...');
      
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, department_code, is_admin, is_suspended, suspended_at, suspended_by, suspension_reason, created_at, avatar_url')
        .order('department_code')
        .order('full_name');

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      console.log('Fetched users:', users);

      // Group users by department and create stats
      const statsMap = new Map<string, DepartmentStats>();
      
      // Initialize all departments with zero counts
      departments.forEach(dept => {
        statsMap.set(dept.code, {
          department: dept,
          userCount: 0,
          adminCount: 0,
          suspendedCount: 0,
          users: []
        });
      });

      // Populate with actual user data
      users?.forEach(user => {
        const existing = statsMap.get(user.department_code);
        if (existing) {
          existing.userCount++;
          if (user.is_admin) {
            existing.adminCount++;
          }
          if (user.is_suspended) {
            existing.suspendedCount++;
          }
          existing.users.push(user);
        } else {
          // Handle users with departments not in the departments list
          const unknownDept = { code: user.department_code, name: `Unknown (${user.department_code})` };
          statsMap.set(user.department_code, {
            department: unknownDept,
            userCount: 1,
            adminCount: user.is_admin ? 1 : 0,
            suspendedCount: user.is_suspended ? 1 : 0,
            users: [user]
          });
        }
      });

      const stats = Array.from(statsMap.values())
        .filter(stat => stat.userCount > 0)
        .sort((a, b) => b.userCount - a.userCount);

      console.log('Department stats:', stats);
      setDepartmentStats(stats);
    } catch (error) {
      console.error('Error loading department users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentUsers();
  }, [departments]);

  const handleDepartmentClick = (stats: DepartmentStats) => {
    setSelectedDepartment(stats);
    setViewMode('department-detail');
  };

  const handleBackToOverview = () => {
    setSelectedDepartment(null);
    setViewMode('overview');
    setFilterSuspended('all');
  };

  const handleSuspendUser = (user: UserProfile) => {
    setSuspensionModal({ isOpen: true, user });
  };

  const handleUnsuspendUser = (user: UserProfile) => {
    setUnsuspensionDialog({ isOpen: true, user });
  };

  const confirmSuspension = async (reason: string) => {
    if (suspensionModal.user) {
      const success = await suspendUser({
        userId: suspensionModal.user.id,
        reason
      });
      
      if (success) {
        await fetchDepartmentUsers();
        setSuspensionModal({ isOpen: false, user: null });
      }
    }
  };

  const confirmUnsuspension = async () => {
    if (unsuspensionDialog.user) {
      const success = await unsuspendUser(unsuspensionDialog.user.id);
      
      if (success) {
        await fetchDepartmentUsers();
        setUnsuspensionDialog({ isOpen: false, user: null });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 2);

  // Filter users based on suspension status
  const getFilteredUsers = (users: UserProfile[]) => {
    switch (filterSuspended) {
      case 'active':
        return users.filter(user => !user.is_suspended);
      case 'suspended':
        return users.filter(user => user.is_suspended);
      default:
        return users;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Loading department user data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'department-detail' && selectedDepartment) {
    const filteredUsers = getFilteredUsers(selectedDepartment.users);
    
    return (
      <>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleBackToOverview}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Overview
              </Button>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {selectedDepartment.department.name} ({selectedDepartment.department.code})
                </CardTitle>
                <CardDescription>
                  {selectedDepartment.userCount} users • {selectedDepartment.adminCount} admins • {selectedDepartment.suspendedCount} suspended
                </CardDescription>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2 mt-4">
              <Button
                variant={filterSuspended === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterSuspended('all')}
              >
                All Users ({selectedDepartment.userCount})
              </Button>
              <Button
                variant={filterSuspended === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterSuspended('active')}
              >
                Active ({selectedDepartment.userCount - selectedDepartment.suspendedCount})
              </Button>
              <Button
                variant={filterSuspended === 'suspended' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterSuspended('suspended')}
              >
                Suspended ({selectedDepartment.suspendedCount})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No users found matching the current filter</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-4 border rounded-lg transition-shadow ${
                        user.is_suspended 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-card hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Avatar className={`w-12 h-12 border-2 ${user.is_suspended ? 'border-red-200' : 'border-border'}`}>
                            <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name} />
                            <AvatarFallback className={`${user.is_suspended ? 'bg-red-100 text-red-700' : 'bg-muted text-foreground'} font-medium`}>
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-gray-900 truncate">
                                {user.full_name}
                              </h3>
                              <div className="flex gap-1">
                                {user.is_admin && (
                                  <Badge variant="secondary" className="text-xs">
                                    Admin
                                  </Badge>
                                )}
                                {user.is_suspended && (
                                  <Badge variant="destructive" className="text-xs flex items-center gap-1">
                                    <Ban className="w-3 h-3" />
                                    Suspended
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <Mail className="w-4 h-4" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Joined: {formatDate(user.created_at)}
                            </p>
                            
                            {user.is_suspended && user.suspension_reason && (
                              <div className="mt-2 p-2 bg-red-100 rounded text-xs">
                                <p className="font-medium text-red-800">Suspension Reason:</p>
                                <p className="text-red-700">{user.suspension_reason}</p>
                                {user.suspended_at && (
                                  <p className="text-red-600 mt-1">
                                    Suspended: {formatDate(user.suspended_at)}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {!user.is_admin && (
                          <div className="ml-2 flex flex-col gap-1">
                            {user.is_suspended ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnsuspendUser(user)}
                                disabled={suspensionLoading}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Unsuspend
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSuspendUser(user)}
                                disabled={suspensionLoading}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Ban className="w-4 h-4 mr-1" />
                                Suspend
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Suspension Modal */}
        <SuspensionModal
          isOpen={suspensionModal.isOpen}
          onClose={() => setSuspensionModal({ isOpen: false, user: null })}
          onConfirm={confirmSuspension}
          userName={suspensionModal.user?.full_name || ''}
          loading={suspensionLoading}
        />

        {/* Unsuspension Dialog */}
        <UnsuspensionDialog
          isOpen={unsuspensionDialog.isOpen}
          onClose={() => setUnsuspensionDialog({ isOpen: false, user: null })}
          onConfirm={confirmUnsuspension}
          userName={unsuspensionDialog.user?.full_name || ''}
          loading={suspensionLoading}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <DepartmentUsersSummaryCards departmentStats={departmentStats} />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <DepartmentUsersBarChart departmentStats={departmentStats} />
      </div>

      {/* Department List */}
      <Card>
        <CardHeader>
          <CardTitle>Department Details</CardTitle>
          <CardDescription>
            Click on any department to view detailed user information and manage suspensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {departmentStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No departments with users found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departmentStats.map((stats) => (
                <Card 
                  key={stats.department.code}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                  onClick={() => handleDepartmentClick(stats)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {stats.department.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {stats.department.code}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Users:</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {stats.userCount}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Admins:</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {stats.adminCount}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Suspended:</span>
                        <Badge variant="outline" className={
                          stats.suspendedCount > 0 
                            ? "bg-red-50 text-red-700" 
                            : "bg-gray-50 text-gray-700"
                        }>
                          {stats.suspendedCount}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentUserManagement;
