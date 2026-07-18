"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
                {error}
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
                <a href="#" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                  Forgot password?
                </a>
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
