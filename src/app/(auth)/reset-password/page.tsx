"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { api } from "@/lib/api";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/reset-password', { token, password });
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred while resetting password");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold tracking-tight text-green-600">Password Reset Successful</CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Your password has been changed. You can now login with your new password.
            <br/><br/>
            Redirecting to login...
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center border-t p-4 mt-6">
          <Link href="/login" className="text-primary font-medium hover:underline text-sm">
            Go to Login now
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold tracking-tight">Create New Password</CardTitle>
        <CardDescription className="text-muted-foreground">
          Please enter your new password below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(!token) ? (
          <div className="p-4 text-center text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
            Invalid reset link. Please request a new password reset email.
            <div className="mt-4">
              <Link href="/forgot-password">
                <Button variant="outline">Request New Link</Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <div className="grid gap-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
                  {error}
                </div>
              )}
              
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  New Password
                </label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    required 
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                  Confirm Password
                </label>
                <Input 
                  id="confirmPassword" 
                  type={showPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                  disabled={isLoading}
                />
              </div>
              
              <Button type="submit" className="w-full mt-2" size="lg" disabled={isLoading}>
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center">
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
