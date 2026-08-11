"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useCallback } from "react";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const handleGoogleSuccess = useCallback(async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    try {
      setIsLoading(true);
      const response = await api.post('/auth/google', { 
        credential: credentialResponse.credential,
        is_signup: false 
      });
      login(response.user);
    } catch (err: any) {
      setError(err.message || "Google Login failed");
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const handleGoogleError = useCallback(() => {
    setError("Google Login failed");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        remember_me: rememberMe
      });

      // The api client already unwraps the response, so response IS the data object
      login(response.user);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    setResendStatus("");
    
    try {
      await api.post('/auth/resend-verification', { email });
      setResendStatus("A new verification email has been sent.");
      setResendCountdown(60);
      
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setResendStatus(err.message || "Failed to resend. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your credentials to access LogistiCore
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin}>
          <div className="grid gap-5">
            {error && !error.includes("verify your email") && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
                {error}
              </div>
            )}

            {error && error.includes("verify your email") && (
              <div className="p-4 text-sm text-amber-800 bg-amber-50 rounded-md border border-amber-200 flex flex-col space-y-3">
                <div className="font-medium">Your email is not verified.</div>
                <div>Please verify your email before signing in.</div>
                
                <div className="pt-2 border-t border-amber-200/50">
                  <p className="mb-2 text-amber-700/80">Didn't receive the email?</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="w-full bg-white hover:bg-amber-100 border-amber-300 text-amber-700"
                    onClick={handleResend}
                    disabled={isResending || resendCountdown > 0}
                  >
                    {isResending ? "Sending..." : resendCountdown > 0 ? `Resend available in ${resendCountdown}s...` : "Resend Verification Email"}
                  </Button>
                  
                  {resendStatus && (
                    <div className="mt-2 text-xs font-medium text-center text-amber-700">
                      {resendStatus}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@logisticore.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required 
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                disabled={isLoading} 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label htmlFor="remember" className="text-sm font-medium leading-none">
                Remember me for 7 days
              </label>
            </div>
            <Button type="submit" className="w-full mt-2" size="lg" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="flex justify-center w-full">
          <GoogleAuthButton
            isLoading={isLoading}
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="continue_with"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
