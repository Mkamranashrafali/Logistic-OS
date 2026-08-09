"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Map,
  Users,
  Truck,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  Receipt,
  FileText as FileIcon,
  History as HistoryIcon,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/orders", icon: Package },
  { name: "Planning", href: "/planning", icon: CalendarDays },
  { name: "Trips", href: "/trips", icon: Map },
  { name: "Drivers", href: "/drivers", icon: Users },
  { name: "Vehicles", href: "/vehicles", icon: Truck },
  { name: "Customers", href: "/customers", icon: Building2 },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "History", href: "/history", icon: HistoryIcon },
];

const secondaryNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isDriver = user?.role === 'driver';

  const currentNavigation = isDriver 
    ? [
        { name: "Portal", href: "/driver/dashboard", icon: LayoutDashboard },
        { name: "Trips", href: "/driver/trips", icon: Map },
        { name: "Fuel & Expenses", href: "/driver/expenses", icon: Receipt },
        { name: "Profile", href: "/driver/profile", icon: Users },
      ]
    : navigation;

  return (
    <div className="flex h-full w-64 flex-col border-r bg-sidebar px-4 py-6">
      <div className="flex items-center gap-2 px-2 pb-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
          L
        </div>
        <span className="text-xl font-bold tracking-tight">LogistiCore</span>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        {currentNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground border border-primary/20 shadow-sm"
                    : "text-muted-foreground border border-transparent hover:bg-secondary hover:text-foreground"
                )}
              >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </div>

      {!isDriver && (
        <div className="flex flex-col gap-1 pt-6 border-t">
          {secondaryNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground border border-primary/20 shadow-sm"
                    : "text-muted-foreground border border-transparent hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
