
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BrandingPanel from './auth/BrandingPanel';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Checking for valid reset session...');
        
        // Check URL hash for auth tokens (Supabase password reset format)
        const hash = window.location.hash;
        const urlParams = new URLSearchParams(window.location.search);
        
        if (hash.includes('access_token') && hash.includes('refresh_token') && hash.includes('type=recovery')) {
          console.log('Valid password reset tokens found in URL hash');
          setValidSession(true);
          return;
        }
        
        if (urlParams.get('type') === 'recovery') {
          console.log('Password reset type parameter found');
          setValidSession(true);
          return;
        }

        // Fallback: Check current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          setValidSession(false);
          setError('Invalid or expired reset link. Please request a new password reset.');
          return;
        }

        if (!session) {
          console.log('No session found - invalid reset link');
          setValidSession(false);
          setError('Invalid or expired reset link. Please request a new password reset.');
          return;
        }

        console.log('Valid reset session found');
        setValidSession(true);
      } catch (err) {
        console.error('Unexpected error checking session:', err);
        setValidSession(false);
        setError('An error occurred while verifying your reset link.');
      }
    };
    
    checkSession();
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to update password...');
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Password update error:', error);
        setError(error.message);
      } else {
        console.log('Password updated successfully');
        setSuccess(true);
        toast({
          title: "Password Updated",
          description: "Your password has been successfully updated."
        });
        
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/?reset=success';
        }, 3000);
      }
    } catch (err) {
      console.error('Unexpected password update error:', err);
      setError('Unable to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking session
  if (validSession === null) {
    return (
      <div className="min-h-screen flex">
        <BrandingPanel />
        
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md">
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Verifying reset link...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Invalid session state
  if (validSession === false) {
    return (
      <div className="min-h-screen flex">
        <BrandingPanel />
        
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
              <p className="text-gray-600">The password reset link is invalid or has expired</p>
            </div>

            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-8">
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Password reset links expire after a certain time for security reasons. 
                    Please request a new password reset link.
                  </p>
                  
                  <Button 
                    onClick={() => window.location.href = '/'}
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Back to Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex">
        <BrandingPanel />
        
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Password Updated</h2>
              <p className="text-gray-600">Your password has been successfully updated</p>
            </div>

            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-8">
                <Alert className="bg-green-50 border-green-200 text-green-800 mb-6">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your password has been successfully updated. You will be redirected to the login page shortly.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={() => window.location.href = '/'}
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Go to Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Main password reset form
  return (
    <div className="min-h-screen flex">
      <BrandingPanel />
      
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h2>
            <p className="text-gray-600">Create a strong password for your account</p>
          </div>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Password Requirements */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• At least 6 characters long</li>
                    <li>• At least one uppercase letter</li>
                    <li>• At least one lowercase letter</li>
                    <li>• At least one number</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-700 font-medium">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors" 
                  disabled={loading}
                >
                  {loading ? 'Updating Password...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-8 text-sm text-gray-500">
            <p>QMAZ HOLDING HELP DESK SYSTEM</p>
            <p>Version 1.0</p>
            <p>© Digital System Team 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
