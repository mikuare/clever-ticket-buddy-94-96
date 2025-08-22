
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Circle, Clock, UserCheck, UserX } from 'lucide-react';
import { useRealTimeUserPresence } from '@/hooks/useRealTimeUserPresence';
import type { Department } from '@/types/admin';

interface UserPresenceViewProps {
  departments: Department[];
}

const UserPresenceView = ({ departments }: UserPresenceViewProps) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const {
    allUsers,
    loading,
    getOnlineUsers,
    getOfflineUsers,
    getUsersByDepartment,
    getOnlineUsersByDepartment,
    onlineCount,
    totalCount
  } = useRealTimeUserPresence();

  const getFilteredUsers = () => {
    if (selectedDepartment === 'all') {
      return allUsers;
    }
    return getUsersByDepartment(selectedDepartment);
  };

  const getFilteredOnlineCount = () => {
    if (selectedDepartment === 'all') {
      return onlineCount;
    }
    return getOnlineUsersByDepartment(selectedDepartment).length;
  };

  // Get user count per department
  const getDepartmentUserCount = (departmentCode: string) => {
    const departmentUsers = getUsersByDepartment(departmentCode);
    return departmentUsers.length;
  };

  const formatLastSeen = (lastSeen: string) => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInSeconds = Math.floor((now.getTime() - lastSeenDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return lastSeenDate.toLocaleDateString();
    }
  };

  const filteredUsers = getFilteredUsers();
  const onlineUsers = filteredUsers.filter(user => user.is_online);
  const offlineUsers = filteredUsers.filter(user => !user.is_online);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Real-Time User Presence
        </CardTitle>
        <CardDescription>
          Live tracking of user activity across all departments
        </CardDescription>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Online</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{getFilteredOnlineCount()}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <UserX className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-800">Offline</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{filteredUsers.length - getFilteredOnlineCount()}</p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{filteredUsers.length}</p>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Activity Rate</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {filteredUsers.length > 0 ? Math.round((getFilteredOnlineCount() / filteredUsers.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Department Filter */}
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium">Filter by Department:</label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Choose a department" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="all" className="flex items-center justify-between cursor-pointer">
                  <span>All Departments</span>
                  {totalCount > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                      {totalCount} users
                    </Badge>
                  )}
                </SelectItem>
                {departments.map((dept) => {
                  const userCount = getDepartmentUserCount(dept.code);
                  return (
                    <SelectItem key={dept.code} value={dept.code} className="flex items-center justify-between cursor-pointer">
                      <span>{dept.code} - {dept.name}</span>
                      <Badge 
                        variant="secondary" 
                        className={`ml-2 ${userCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {userCount} user{userCount !== 1 ? 's' : ''}
                      </Badge>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600">Loading user presence...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No Users Found</p>
              <p>
                {selectedDepartment === 'all' 
                  ? 'No users found in any department.' 
                  : `No users found in the ${selectedDepartment} department.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Online Users */}
              {onlineUsers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Circle className="w-4 h-4 text-green-500 fill-green-500" />
                    Online Users ({onlineUsers.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {onlineUsers.map((user) => (
                      <div
                        key={user.id}
                        className="p-4 border rounded-lg bg-green-50 hover:bg-green-100 transition-shadow border-green-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-green-800">
                                {user.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <Circle className="absolute -bottom-1 -right-1 w-4 h-4 text-green-500 fill-green-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {user.full_name}
                              {user.is_admin && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  Admin
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {user.department_code}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="text-xs bg-green-100 text-green-800">
                                Online
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Active now
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Offline Users */}
              {offlineUsers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Circle className="w-4 h-4 text-gray-400 fill-gray-400" />
                    Offline Users ({offlineUsers.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {offlineUsers.map((user) => (
                      <div
                        key={user.id}
                        className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {user.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <Circle className="absolute -bottom-1 -right-1 w-4 h-4 text-gray-400 fill-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {user.full_name}
                              {user.is_admin && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  Admin
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {user.department_code}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                Offline
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatLastSeen(user.last_seen)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPresenceView;
