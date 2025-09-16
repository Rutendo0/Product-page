import React, { useState } from 'react';
import { useSignUp } from '@clerk/clerk-react';
import { Link, useLocation } from 'wouter';
import { Eye, EyeOff, Mail, User, Lock, Store, Briefcase, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const SellerRegister = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signUp, setActive } = useSignUp();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email';
    return '';
  };

  const validateUsername = (username: string) => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain a number';
    return '';
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) return 'Confirm password is required';
    if (confirmPassword !== password) return "Passwords don't match";
    return '';
  };


  const validateField = (name: string) => {
    let error = '';
    switch (name) {
      case 'email':
        error = validateEmail(email);
        break;
      case 'username':
        error = validateUsername(username);
        break;
      case 'password':
        error = validatePassword(password);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(confirmPassword);
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    newErrors.email = validateEmail(email);
    newErrors.username = validateUsername(username);
    newErrors.password = validatePassword(password);
    newErrors.confirmPassword = validateConfirmPassword(confirmPassword);
    setErrors(newErrors);

    return Object.values(newErrors).every(error => !error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;

    const isValid = validateForm();
    if (!isValid) {
      toast({ title: "Please fix the errors below", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const signUpAttempt = await signUp.create({
        emailAddress: email,
        username: username,
        password,
        // @ts-ignore - Type may not include publicMetadata in older types
        publicMetadata: {
          isSeller: true,
        },
      } as any);

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        navigate('/products');
      } else if (signUpAttempt.status === 'missing_requirements') {
        // Send verification email
        await signUpAttempt.prepareEmailAddressVerification({ strategy: 'email_code' });
        toast({ title: "Verification email sent! Check your inbox." });
        navigate('/verify-email');
      } else {
        toast({ title: "Registration incomplete. Please try again.", variant: "destructive" });
      }
    } catch (err: any) {
      let errorMessage = "Registration failed. Please try again.";
      if (err.errors && err.errors.length > 0) {
        const clerkError = err.errors[0];
        switch (clerkError.code) {
          case 'form_identifier_exists':
            errorMessage = 'An account with this email already exists.';
            break;
          case 'form_username_exists':
            errorMessage = 'This username is already taken.';
            break;
          case 'password_too_short':
            errorMessage = 'Password is too short. Please use at least 8 characters.';
            break;
          case 'weak_password':
            errorMessage = 'Password is too weak. Please include uppercase, lowercase, and a number.';
            break;
          case 'form_password_invalid':
            errorMessage = 'Invalid password format.';
            break;
          case 'network_error':
            errorMessage = 'Network error. Please check your connection.';
            break;
          default:
            errorMessage = clerkError.message || errorMessage;
        }
      }
      toast({ title: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (setter: (val: string) => void, name: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setter(value);
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-0 bg-green-700 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <Store className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl text-foreground">Become a Seller</CardTitle>
          <CardDescription className="text-muted-foreground">
            Create your seller account. Already have an account? <Link href="/login" className="font-medium text-green-950 hover:text-white">Sign in</Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-6">
              {/* Personal Info Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="email">Email</Label>
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={handleInputChange(setEmail, 'email')}
                    onBlur={() => validateField('email')}
                    className={errors.email ? "border-destructive" : ""}
                    required
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="username">Username</Label>
                </div>
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={handleInputChange(setUsername, 'username')}
                  onBlur={() => validateField('username')}
                  className={errors.username ? "border-destructive" : ""}
                  required
                />
                {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={handleInputChange(setPassword, 'password')}
                    onBlur={() => validateField('password')}
                    className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 p-0"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={handleInputChange(setConfirmPassword, 'confirmPassword')}
                    onBlur={() => validateField('confirmPassword')}
                    className={`pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 p-0"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Seller Account'}
            </Button>
          </form>
          <div className="text-center text-sm text-muted-foreground">
            By creating an account, you agree to our terms and privacy policy.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerRegister;