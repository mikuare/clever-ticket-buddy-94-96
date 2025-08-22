
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SignupFormFields from './SignupFormFields';
import { useIsMobile } from '@/hooks/use-mobile';

interface Department {
  code: string;
  name: string;
}

interface SignupFormContentProps {
  onBackToLogin: () => void;
}

const SignupFormContent = ({ onBackToLogin }: SignupFormContentProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    departmentCode: '',
    authKey: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const { signUp } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('code, name')
        .order('name');
      
      if (error) throw error;
      setDepartments(data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const validatePassword = (password: string) => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasLength = password.length >= 8;
    
    return hasUpper && hasLower && (hasNumber || hasSpecial) && hasLength;
  };

  const validateAuthKey = async (departmentCode: string, authKey: string) => {
    if (departmentCode !== 'ADM') return true;
    
    try {
      const { data } = await supabase
        .from('department_auth_keys')
        .select('auth_key')
        .eq('department_code', departmentCode)
        .single();
      
      return data?.auth_key === authKey;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validatePassword(formData.password)) {
      setError('Password does not meet requirements');
      setLoading(false);
      return;
    }

    // Validate auth key for ADM department
    if (formData.departmentCode === 'ADM') {
      if (!formData.authKey) {
        setError('Authorization key is required for Digital System Authorization department');
        setLoading(false);
        return;
      }
      
      const isValidKey = await validateAuthKey(formData.departmentCode, formData.authKey);
      if (!isValidKey) {
        setError('Invalid authorization key for Digital System Authorization department');
        setLoading(false);
        return;
      }
    }

    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.departmentCode
      );
      
      if (error) {
        setError(error.message);
      } else {
        toast({
          title: "Account Created",
          description: "Please check your email to verify your account."
        });
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Create Account</h2>
            <p className="text-muted-foreground">Join the help desk system</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <SignupFormFields
                  formData={formData}
                  setFormData={setFormData}
                  departments={departments}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  validatePassword={validatePassword}
                  error={error}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-medium mt-6" 
                  disabled={loading || !validatePassword(formData.password) || !formData.departmentCode || (formData.departmentCode === 'ADM' && !formData.authKey)}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6 text-xs text-muted-foreground">
            <p>QMAZ HOLDING HELP DESK SYSTEM</p>
            <p>Version 1.0</p>
            <p>© Digital System Team 2025</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Join the help desk system</p>
        </div>

        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <SignupFormFields
                formData={formData}
                setFormData={setFormData}
                departments={departments}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                validatePassword={validatePassword}
                error={error}
              />

              <Button 
                type="submit" 
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors mt-6" 
                disabled={loading || !validatePassword(formData.password) || !formData.departmentCode || (formData.departmentCode === 'ADM' && !formData.authKey)}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  Back to Sign In
                </button>
              </div>
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
  );
};

export default SignupFormContent;
