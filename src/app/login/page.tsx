
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, GoogleAuthProvider, OAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn as LogInIcon, AlertTriangle } from 'lucide-react';

// Simple Google G Logo SVG - Kept for potential future re-add
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.6402 9.20455C17.6402 8.56818 17.582 7.94318 17.4695 7.34091H9V10.8409H13.8439C13.6366 11.9943 13.0002 12.9716 12.0457 13.625V15.9602H14.9548C16.6588 14.4034 17.6402 12.0057 17.6402 9.20455Z" fill="#4285F4"/>
    <path d="M9.00001 18C11.4307 18 13.4696 17.1989 14.9548 15.9602L12.0457 13.625C11.2591 14.1534 10.2273 14.4886 9.00001 14.4886C6.65455 14.4886 4.67159 12.8977 3.96023 10.75H1.00001V13.1705C2.46023 16.0455 5.48296 18 9.00001 18Z" fill="#34A853"/>
    <path d="M3.96023 10.75C3.78409 10.2386 3.68182 9.68182 3.68182 9.09091C3.68182 8.5 3.78409 7.94318 3.94886 7.43182V5.01136H1C0.363636 6.20455 0 7.59659 0 9.09091C0 10.5852 0.363636 11.9773 1 13.1705L3.96023 10.75Z" fill="#FBBC05"/>
    <path d="M9.00001 3.69318C10.3432 3.69318 11.5057 4.14773 12.4193 5.01136L15.0216 2.48864C13.4696 0.954545 11.4307 0 9.00001 0C5.48296 0 2.46023 1.95455 1.00001 5.01136L3.94886 7.43182C4.67159 5.28409 6.65455 3.69318 9.00001 3.69318Z" fill="#EA4335"/>
  </svg>
);

// Simple Apple Logo SVG - Kept for potential future re-add
const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.7344 9.84375C14.7394 9.84375 14.7774 7.68281 16.0444 6.68906C15.2504 5.67188 14.1024 5.38125 13.5564 5.35781C12.3014 5.20781 11.3344 6.01875 10.8324 6.01875C10.3304 6.01875 9.19291 5.21812 7.97885 5.325C6.93285 5.40469 5.95035 5.86875 5.2641 6.68906C3.88285 8.34844 3.71629 10.9219 5.06479 12.75C5.71204 13.6266 6.58204 14.6719 7.75551 14.6719C8.90151 14.6719 9.26485 13.9828 10.5965 13.9828C11.9173 13.9828 12.2165 14.6719 13.4555 14.6484C14.7054 14.6141 15.4444 13.6109 16.0674 12.7078C15.2814 12.2391 14.7444 11.1188 14.7444 9.84375H14.7344ZM10.0524 4.07812C10.5704 3.45469 11.3648 2.98125 12.1088 2.8125C11.9424 3.51094 11.3964 4.26094 10.8894 4.74844C10.4198 5.18906 9.70035 5.70469 9.0141 5.625C9.20785 4.9125 9.65235 4.33594 10.0524 4.07812Z"/>
  </svg>
);


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push('/');
    } catch (err: any) {
      let errorMessage = "Failed to login. Please check your credentials.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Too many login attempts. Please try again later.";
      } else {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Temporarily commenting out social login functionality
  // const handleSocialLogin = async (providerName: 'google' | 'apple') => {
  //   setLoading(true);
  //   setError(null);
  //   let provider;
  //   if (providerName === 'google') {
  //     provider = new GoogleAuthProvider();
  //   } else if (providerName === 'apple') {
  //     provider = new OAuthProvider('apple.com');
  //   } else {
  //     setError("Invalid login provider.");
  //     setLoading(false);
  //     return;
  //   }

  //   try {
  //     await signInWithPopup(auth, provider);
  //     toast({
  //       title: "Login Successful",
  //       description: `Welcome! You've signed in with ${providerName.charAt(0).toUpperCase() + providerName.slice(1)}.`,
  //     });
  //     router.push('/');
  //   } catch (err: any) {
  //     let errorMessage = `Failed to sign in with ${providerName}. Please try again.`;
  //     if (err.code === 'auth/account-exists-with-different-credential') {
  //       errorMessage = "An account already exists with the same email address but different sign-in credentials. Try signing in with the original method.";
  //     } else if (err.code === 'auth/popup-closed-by-user') {
  //       errorMessage = "Sign-in process was cancelled.";
  //     } else if (err.code === 'auth/cancelled-popup-request') {
  //        errorMessage = "Sign-in process was cancelled. Only one sign-in attempt is allowed at a time.";
  //     } else if (err.code === 'auth/popup-blocked') {
  //       errorMessage = "Sign-in popup was blocked by the browser. Please disable your popup blocker and try again.";
  //     } else if (err.code === 'auth/unauthorized-domain') {
  //       errorMessage = "This domain is not authorized for this sign-in method. Please check Firebase configuration.";
  //     }
  //      else {
  //       errorMessage = err.message || errorMessage;
  //     }
  //     setError(errorMessage);
  //     toast({
  //       variant: "destructive",
  //       title: "Login Failed",
  //       description: errorMessage,
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LogInIcon className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Login</CardTitle>
          <CardDescription>Access your Track-My-Bills dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleEmailPasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="text-base"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="text-base pr-10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full text-base" disabled={loading}>
              {loading ? 'Logging in...' : 'Login with Email'}
            </Button>
          </form>

          {error && (
            <div className="flex items-start space-x-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          {/* Temporarily hiding social login options */}
          {/*
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full text-base" 
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
            >
              <GoogleIcon /> 
              <span className="ml-2">Sign in with Google</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-base" 
              onClick={() => handleSocialLogin('apple')}
              disabled={loading}
            >
              <AppleIcon /> 
              <span className="ml-2">Sign in with Apple</span>
            </Button>
          </div>
          */}

        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
