import { SignUp } from '@clerk/clerk-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Register = () => {
  const { isSignedIn } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isSignedIn) {
      navigate('/products');
    } else {
      navigate('/seller-register');
    }
  }, [isSignedIn, navigate]);

  return null;
};

export default Register;