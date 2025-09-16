import { SignUp } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'wouter';

const Register = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
        <CardDescription>Join Car Parts Hub</CardDescription>
      </CardHeader>
      <CardContent>
        <SignUp />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </CardFooter>
    </Card>
  </div>
);

export default Register;