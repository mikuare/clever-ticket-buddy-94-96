import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '../LoadingSpinner';
import { UserCheck, Search, Crown, User, AlertTriangle, Lock, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  department_code: string;
  is_admin: boolean;
  is_suspended: boolean;
  avatar_url?: string;
}

const UserImpersonationManager = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const { toast } = useToast();
  const { signOut } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const validateAuthPassword = async () => {
    if (!authPassword.trim()) {
      setAuthError('Authorization key is required');
      return;
    }

    setAuthLoading(true);
    setAuthError('');

    try {
      // Check if the entered password matches any auth key in the system
      const { data, error } = await supabase
        .from('department_auth_keys')
        .select('auth_key')
        .eq('auth_key', authPassword.trim());

      if (error) throw error;

      if (data && data.length > 0) {
        setIsAuthenticated(true);
        setAuthPassword('');
        toast({
          title: "Access Granted",
          description: "You can now access user impersonation features",
        });
      } else {
        setAuthError('Invalid authorization key');
      }
    } catch (error) {
      console.error('Error validating auth key:', error);
      setAuthError('Failed to validate authorization key');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, department_code, is_admin, is_suspended, avatar_url')
        .order('full_name');

      if (error) throw error;
      
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonateUser = (user: UserProfile) => {
    setSelectedUser(user);
    setShowConfirmDialog(true);
  };

  const confirmImpersonation = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      
      // Call the impersonation edge function
      const { data, error } = await supabase.functions.invoke('admin-impersonate-user', {
        body: { targetUserId: selectedUser.id }
      });

      if (error) {
        console.error('Impersonation error:', error);
        toast({
          title: "Error",
          description: "Failed to generate impersonation session",
          variant: "destructive",
        });
        return;
      }

      if (data.authUrl) {
        // Store impersonation context in sessionStorage for tracking
        sessionStorage.setItem('impersonation_context', JSON.stringify({
          originalAdminId: (await supabase.auth.getUser()).data.user?.id,
          targetUser: data.targetUser,
          timestamp: new Date().toISOString()
        }));

        // Sign out current admin
        await signOut();
        
        // Navigate to the auth URL to automatically sign in as target user
        window.location.href = data.authUrl;
      } else {
        toast({
          title: "Error",
          description: "Failed to generate authentication link",
          variant: "destructive",
        });
      }
      
      setShowConfirmDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error during impersonation:', error);
      toast({
        title: "Error",
        description: "Failed to impersonate user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              User Impersonation Access
            </CardTitle>
            <CardDescription>
              Enter the authorization key to access user impersonation features. This is required for security purposes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {authError && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="auth-password">Authorization Key</Label>
              <div className="flex gap-2">
                <Input
                  id="auth-password"
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Enter authorization key"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      validateAuthPassword();
                    }
                  }}
                />
                <Button
                  onClick={validateAuthPassword}
                  disabled={authLoading || !authPassword.trim()}
                  className="flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {authLoading ? 'Verifying...' : 'Authenticate'}
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> The authorization key is one of the keys configured in the Auth Keys section. 
                This security measure ensures only authorized admins can access user impersonation features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            User Impersonation
          </CardTitle>
          <CardDescription>
            Sign in as any user for testing and debugging purposes. Only available to admin users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.full_name}</h3>
                      {user.is_admin && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Admin
                        </Badge>
                      )}
                      {user.is_suspended && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Suspended
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Department: {user.department_code}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleImpersonateUser(user)}
                  className="flex items-center gap-2"
                  disabled={user.is_suspended}
                >
                  <User className="w-4 h-4" />
                  Sign in as user
                </Button>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No users found matching your search.' : 'No users available.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Confirm User Impersonation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign in as <strong>{selectedUser?.full_name}</strong> ({selectedUser?.email})?
              <br />
              <br />
              This will log you out of your current admin session and sign you in as the selected user. 
              You should only do this for testing and debugging purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImpersonation}>
              Yes, Impersonate User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserImpersonationManager;