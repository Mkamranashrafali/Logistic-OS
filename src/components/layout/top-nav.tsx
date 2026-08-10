"use client";

import { Menu, User as UserIcon, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { getImageUrl } from "@/lib/api";
import { useState, useEffect } from "react";

function getInitials(name?: string, email?: string): string {
  if (!name && !email) return "?";
  if (!name && email) return email.charAt(0).toUpperCase();
  
  const parts = name!.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return name!.charAt(0).toUpperCase();
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function TopNav() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const [avatarError, setAvatarError] = useState(false);
  const avatarSrc = avatarError ? undefined : getImageUrl(user?.profile_pic_url);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.profile_pic_url]);

  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end gap-1">
              <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
              <div className="h-3 w-16 animate-pulse rounded bg-muted"></div>
            </div>
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted"></div>
          </div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="relative flex items-center gap-3 h-auto p-1.5 rounded-full hover:bg-secondary/80 focus-visible:ring-1 focus-visible:ring-primary transition-all cursor-pointer border-none bg-transparent outline-none">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold leading-none text-foreground">
                  {user.name || user.email}
                </span>
                <span className="text-xs font-medium mt-1 text-muted-foreground">
                  {capitalizeFirstLetter(user.role)}
                </span>
              </div>
              <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-sm overflow-hidden flex items-center justify-center bg-primary/5">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    key={avatarSrc}
                    alt={user.name || user.email}
                    className="h-full w-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                    {getInitials(user.name, user.email)}
                  </AvatarFallback>
                )}
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name || user.email}</p>
                  {user.name && user.name !== user.email && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(user.role === 'driver' ? "/driver/profile" : "/settings")} className="cursor-pointer flex w-full">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/change-password")} className="cursor-pointer flex w-full">
                <Settings className="mr-2 h-4 w-4" />
                <span>Change Password</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  );
}
