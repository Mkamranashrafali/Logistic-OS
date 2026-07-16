"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const { user, updateAuthUser } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/auth/change-password', {
        new_password: password
      });

      // Update user context
      if (user) {
        const updatedUser = { ...user, must_change_password: false };
        updateAuthUser(updatedUser);
        
        // Redirect based on role
        if (updatedUser.role === 'driver') {
          router.push('/driver/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-0 max-w-md mx-auto w-full mt-24">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold tracking-tight">Security Required</CardTitle>
        <CardDescription className="text-muted-foreground">
          You must change your default password before continuing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                New Password
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
              <label htmlFor="confirm" className="text-sm font-medium leading-none">
                Confirm Password
              </label>
              <Input 
                id="confirm" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                required 
                disabled={isLoading}
              />
            </div>
            
            <Button type="submit" className="w-full mt-2" size="lg" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
