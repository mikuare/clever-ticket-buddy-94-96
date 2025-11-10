import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm = ({ onBackToLogin }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use the production Vercel URL for password reset redirects
      const isProduction = window.location.hostname.includes('vercel.app');
      const redirectUrl = isProduction 
        ? 'https://help-desk-qmaz-v1-iota.vercel.app/reset-password'
        : `${window.location.origin}/reset-password`;
      
      console.log('Password reset redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        toast({
          title: "Reset Email Sent",
          description: "Please check your email for password reset instructions."
        });
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Unable to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
        <div className="text-center mb-6">
          <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-foreground mb-2`}>Check Your Email</h2>
          <p className="text-muted-foreground">We've sent password reset instructions to your email</p>
        </div>

        <Card>
          <CardContent className={`${isMobile ? 'p-6' : 'p-8'}`}>
            <Alert className="mb-6">
              <AlertDescription>
                A password reset link has been sent to <strong>{email}</strong>. 
                Please check your inbox and follow the instructions to reset your password.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={onBackToLogin}
              variant="outline"
              className={`w-full ${isMobile ? 'h-12 text-base' : 'h-12'} font-semibold`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
        
        <div className={`text-center ${isMobile ? 'mt-6' : 'mt-8'} ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
          <p>QMAZ HOLDING HELP DESK SYSTEM</p>
          <p>Version 1.2</p>
          <p>© Digital System Team 2025</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
      <div className="text-center mb-6">
        <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-foreground mb-2`}>Reset Password</h2>
        <p className="text-muted-foreground">Enter your email address and we'll send you reset instructions</p>
      </div>

      <Card>
        <CardContent className={`${isMobile ? 'p-6' : 'p-8'}`}>
          <form onSubmit={handleSubmit} className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email address"
                className={`${isMobile ? 'h-12 text-base' : 'h-12'}`}
                required
              />
            </div>

            <Button 
              type="submit" 
              className={`w-full ${isMobile ? 'h-12 text-base' : 'h-12'} font-semibold`}
              disabled={loading}
            >
              {loading ? 'Sending Reset Email...' : 'Send Reset Email'}
            </Button>

            <Button 
              type="button"
              onClick={onBackToLogin}
              variant="outline"
              className={`w-full ${isMobile ? 'h-12 text-base' : 'h-12'} font-semibold`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className={`text-center ${isMobile ? 'mt-6' : 'mt-8'} ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
        <p>QMAZ HOLDING HELP DESK SYSTEM</p>
        <p>Version 1.2</p>
        <p>© Digital System Team 2025</p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
