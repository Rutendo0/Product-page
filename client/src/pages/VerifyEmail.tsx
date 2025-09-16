import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useSignUp } from '@clerk/clerk-react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const VerifyEmail = () => {
  const [, navigate] = useLocation();
  const { signUp, setActive } = useSignUp();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp || !code) return;

    setIsVerifying(true);
    setError('');
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        navigate('/products');
      } else {
        setError('Invalid code. Please check your email and try again.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!signUp) return;

    setIsResending(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      toast({ title: "Verification email resent! Check your inbox." });
    } catch (err: any) {
      toast({ title: "Failed to resend email. Please try again.", variant: "destructive" });
    } finally {
      setIsResending(false);
    }
  };

  if (!signUp) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification code to your email. Enter it below to complete registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isVerifying || !code}>
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>
          <div className="text-center space-y-2">
            <Button
              type="button"
              variant="link"
              onClick={handleResend}
              disabled={isResending}
              className="p-0 h-auto"
            >
              {isResending ? 'Resending...' : 'Resend Code'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Already verified? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;