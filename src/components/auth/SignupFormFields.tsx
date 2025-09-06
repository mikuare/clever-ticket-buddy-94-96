
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Department {
  code: string;
  name: string;
}

interface FormData {
  fullName: string;
  email: string;
  password: string;
  departmentCode: string;
  authKey: string;
}

interface SignupFormFieldsProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  departments: Department[];
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  validatePassword: (password: string) => boolean;
  error: string;
}

const SignupFormFields = ({
  formData,
  setFormData,
  departments,
  showPassword,
  setShowPassword,
  validatePassword,
  error
}: SignupFormFieldsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="fullName" className="font-medium">Full Name</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="Enter your full name"
          className={`${isMobile ? 'h-12 text-base' : 'h-11'}`}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="font-medium">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter your email address"
          className={`${isMobile ? 'h-12 text-base' : 'h-11'}`}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="department" className="font-medium">Department</Label>
        <Select onValueChange={(value) => setFormData({ ...formData, departmentCode: value })}>
          <SelectTrigger className={`${isMobile ? 'h-12 text-base' : 'h-11'}`}>
            <SelectValue placeholder="Select your department" />
          </SelectTrigger>
          <SelectContent className="max-h-48 overflow-y-auto">
            {departments.map((dept) => (
              <SelectItem key={dept.code} value={dept.code} className="cursor-pointer">
                {dept.code} - {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Authorization Key field - only show for ADM department */}
      {formData.departmentCode === 'ADM' && (
        <div className="space-y-2">
          <Label htmlFor="authKey" className="font-medium">Authorization Key</Label>
          <Input
            id="authKey"
            type="password"
            value={formData.authKey}
            onChange={(e) => setFormData({ ...formData, authKey: e.target.value })}
            placeholder="Enter authorization key"
            className={`${isMobile ? 'h-12 text-base' : 'h-11'}`}
            required
          />
          <p className="text-xs text-muted-foreground">
            Required for Digital System Authorization access
          </p>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="password" className="font-medium">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Create a strong password"
            className={`${isMobile ? 'h-12 text-base pr-12' : 'h-11 pr-12'}`}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`absolute right-0 top-0 ${isMobile ? 'h-12' : 'h-full'} px-3`}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
            ) : (
              <Eye className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default SignupFormFields;
