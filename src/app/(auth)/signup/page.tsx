"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { GoogleLogin } from '@react-oauth/google';

export default function SignupPage() {
  const { login } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/auth/signup', {
        company_name: companyName,
        owner_name: ownerName,
        email,
        password,
        confirm_password: confirmPassword
      });

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendStatus("Sending...");
    try {
      await api.post('/auth/resend-verification', { email });
      setResendStatus("Verification email resent!");
    } catch (err: any) {
      setResendStatus(err.message || "Failed to resend");
    }
  };

  if (isSuccess) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold tracking-tight text-green-600">Check your inbox</CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Verification email has been sent to <strong>{email}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Please click the link in the email to verify your account before logging in.
          </p>
          <Button variant="outline" onClick={handleResend} className="mt-4">
            Resend Verification Email
          </Button>
          {resendStatus && (
            <p className="text-sm text-primary font-medium">{resendStatus}</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <Link href="/login" className="text-primary font-medium hover:underline text-sm">
            Return to Sign In
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold tracking-tight">Create your Company</CardTitle>
        <CardDescription className="text-muted-foreground">
          Sign up to get started with LogistiCore multi-tenant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup}>
          <div className="grid gap-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="companyName" className="text-sm font-medium leading-none">
                  Company Name
                </label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Logistics"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="ownerName" className="text-sm font-medium leading-none">
                  Your Name
                </label>
                <Input
                  id="ownerName"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="John Doe"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@acme.com"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  Password
                </label>
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
              <div className="grid gap-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                  Confirm Password
                </label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full mt-4" size="lg" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign Up"}
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
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              if (!credentialResponse.credential) return;
              try {
                setIsLoading(true);
                const response = await api.post('/auth/google', { credential: credentialResponse.credential });
                login(response.user);
              } catch (err: any) {
                setError(err.message || "Google Signup failed");
              } finally {
                setIsLoading(false);
              }
            }}
            onError={() => {
              setError("Google Signup failed");
            }}
            useOneTap
            shape="rectangular"
            theme="outline"
            text="signup_with"
            size="large"
            width="100%"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
