import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import BrandingPanel from './auth/BrandingPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileWelcomeScreen from './MobileWelcomeScreen';
import { useDigitalizationTeam } from '@/hooks/useDigitalizationTeam';
import { useITTeam } from '@/hooks/useITTeam';
interface LoginFormProps {
  onShowSignup: () => void;
  onShowForgotPassword: () => void;
  isAdminLoginDuringMaintenance?: boolean;
  maintenanceMessage?: {
    title: string;
    description: string | null;
  };
}
const LoginForm = ({
  onShowSignup,
  onShowForgotPassword,
  isAdminLoginDuringMaintenance = false,
  maintenanceMessage
}: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const {
    signIn
  } = useAuth();
  const {
    toast
  } = useToast();
  const isMobile = useIsMobile();
  const {
    teamMembers: digitalizationTeam,
    loading: digitalizationLoading
  } = useDigitalizationTeam();
  const {
    teamMembers: itTeam,
    loading: itLoading
  } = useITTeam();

  // Check for password reset status in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetStatus = urlParams.get('reset');
    if (resetStatus === 'success') {
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated successfully. You can now login with your new password."
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const {
        error
      } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome back!"
        });
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  if (isMobile) {
    if (showWelcome) {
      return <MobileWelcomeScreen onComplete={() => setShowWelcome(false)} />;
    }
    return <div className="min-h-screen bg-background flex flex-col">
        {/* Login Form Section */}
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome Back
              </h2>
              <p className="text-muted-foreground">
                Sign in to access your dashboard
              </p>
            </div>

            {/* Maintenance Message for Admin Login */}
            {isAdminLoginDuringMaintenance && maintenanceMessage && <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="font-semibold text-amber-800 mb-2">{maintenanceMessage.title}</h3>
                {maintenanceMessage.description && <p className="text-amber-700 text-sm">{maintenanceMessage.description}</p>}
              </div>}

            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium">Email Address</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email address" className="h-12 text-base" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-medium">Password</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="h-12 text-base pr-12" required />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-12 px-3" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  {!isAdminLoginDuringMaintenance && <div className="flex flex-col space-y-2 text-sm text-center">
                      <button type="button" onClick={onShowForgotPassword} className="text-primary hover:underline font-medium">
                        Forgot Password?
                      </button>
                      <button type="button" onClick={onShowSignup} className="text-primary hover:underline font-medium">
                        Create Account
                      </button>
                    </div>}
                </form>
              </CardContent>
            </Card>
            
            <div className="text-center mt-6 text-xs text-muted-foreground">
              <p>QMAZ HOLDINGS HELP DESK SYSTEM</p>
              <p>Version 1.2</p>
              <p>© Digital System Team 2025</p>
            </div>
          </div>
        </div>

        {/* Teams Section */}
        <div className="bg-muted/30 p-4 border-t border-border">
          <div className="space-y-6">
            {/* Digitalization Team */}
            <div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Digitalization Team</h3>
              </div>
              
              {digitalizationLoading ? <div className="flex justify-center">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div> : digitalizationTeam.length > 0 ? <div className="overflow-x-auto pb-2">
                  <div className="flex gap-3 min-w-max px-2">
                    {digitalizationTeam.map(member => <Card key={member.id} className="flex-shrink-0 w-24 bg-card/50 border border-border/50">
                        <CardContent className="p-3 text-center">
                          <div className="w-12 h-12 mx-auto mb-2 rounded-lg overflow-hidden bg-muted border">
                            {member.image_url ? <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" onError={e => {
                        const target = e.currentTarget;
                        const fallback = document.createElement('div');
                        fallback.className = 'w-full h-full flex items-center justify-center text-foreground font-semibold text-xs bg-muted';
                        fallback.textContent = member.name.split(' ').map(n => n[0]).join('').toUpperCase();
                        target.parentNode?.replaceChild(fallback, target);
                      }} /> : <div className="w-full h-full flex items-center justify-center text-foreground font-semibold text-xs">
                                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>}
                          </div>
                          <h4 className="font-medium text-foreground text-xs leading-tight mb-1">{member.name}</h4>
                          <p className="text-muted-foreground text-xs leading-tight">{member.job_title}</p>
                        </CardContent>
                      </Card>)}
                  </div>
                </div> : <p className="text-center text-muted-foreground text-sm">No team members available</p>}
            </div>

            {/* IT Team */}
            <div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">IT Team</h3>
              </div>
              
              {itLoading ? <div className="flex justify-center">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div> : itTeam.length > 0 ? <div className="overflow-x-auto pb-2">
                  <div className="flex gap-3 min-w-max px-2">
                    {itTeam.map(member => <Card key={member.id} className="flex-shrink-0 w-24 bg-card/50 border border-border/50">
                        <CardContent className="p-3 text-center">
                          <div className="w-12 h-12 mx-auto mb-2 rounded-lg overflow-hidden bg-muted border">
                            {member.image_url ? <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" onError={e => {
                        const target = e.currentTarget;
                        const fallback = document.createElement('div');
                        fallback.className = 'w-full h-full flex items-center justify-center text-foreground font-semibold text-xs bg-muted';
                        fallback.textContent = member.name.split(' ').map(n => n[0]).join('').toUpperCase();
                        target.parentNode?.replaceChild(fallback, target);
                      }} /> : <div className="w-full h-full flex items-center justify-center text-foreground font-semibold text-xs">
                                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>}
                          </div>
                          <h4 className="font-medium text-foreground text-xs leading-tight mb-1">{member.name}</h4>
                          <p className="text-muted-foreground text-xs leading-tight">{member.job_title}</p>
                        </CardContent>
                      </Card>)}
                  </div>
                </div> : <p className="text-center text-muted-foreground text-sm">No team members available</p>}
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen flex">
      <div className="flex-[70]">
        <BrandingPanel />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-[30] flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Maintenance Message for Admin Login */}
          {isAdminLoginDuringMaintenance && maintenanceMessage && <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-semibold text-amber-800 mb-2">{maintenanceMessage.title}</h3>
              {maintenanceMessage.description && <p className="text-amber-700 text-sm">{maintenanceMessage.description}</p>}
            </div>}

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email address" className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 pr-12" required />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                {!isAdminLoginDuringMaintenance && <div className="flex justify-between items-center text-sm">
                    <button type="button" onClick={onShowForgotPassword} className="text-indigo-600 hover:text-indigo-700 font-medium">
                      Forgot Password?
                    </button>
                    <button type="button" onClick={onShowSignup} className="text-indigo-600 hover:text-indigo-700 font-medium">
                      Create Account
                    </button>
                  </div>}
              </form>
            </CardContent>
          </Card>
          
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>QMAZ HOLDINGS HELP DESK SYSTEM</p>
            <p>Version 1.2</p>
            <p>© Digital System Team 2025</p>
          </div>
        </div>
      </div>
    </div>;
};
export default LoginForm;