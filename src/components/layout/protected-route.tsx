"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      const isDriverRoute = pathname.startsWith("/driver/") || pathname === "/driver";
      
      if (!user) {
        router.push("/login");
      } else if (user.must_change_password && pathname !== "/change-password") {
        router.push("/change-password");
      } else if (user.role === "driver" && !isDriverRoute) {
        router.push("/driver/dashboard");
      } else if (user.role !== "driver" && isDriverRoute) {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Prevent flash of unauthorized content before redirect completes
  const isDriverRoute = pathname.startsWith("/driver/") || pathname === "/driver";
  if (user.role === "driver" && !isDriverRoute) return null;
  if (user.role !== "driver" && isDriverRoute) return null;
  if (user.must_change_password && pathname !== "/change-password") return null;

  return <>{children}</>;
}
