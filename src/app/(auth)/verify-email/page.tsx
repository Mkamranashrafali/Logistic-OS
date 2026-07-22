"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token found in URL.");
      return;
    }

    const verifyToken = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "Invalid or expired token.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <Card className="shadow-lg border-0 w-full max-w-md mx-auto mt-10">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {status === "loading" && "Verifying Email"}
          {status === "success" && <span className="text-green-600">Email Verified!</span>}
          {status === "error" && <span className="text-red-600">Verification Failed</span>}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {status === "loading" && "Please wait while we verify your email address..."}
          {status === "success" && "Your email has been successfully verified."}
          {status === "error" && "We could not verify your email address."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center py-6">
        {status === "loading" && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        )}
        
        {status === "success" && (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              You can now sign in to your account to access the dashboard.
            </p>
            <Button onClick={() => router.push("/login")} size="lg">
              Proceed to Sign In
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100 w-full text-center">
              {errorMessage}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              The token may be invalid or has expired. You can request a new verification email from the sign up page if you haven't received it.
            </p>
            <Button variant="outline" onClick={() => router.push("/login")} className="mt-2">
              Back to Sign In
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
