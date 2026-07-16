"use client";

import { useEffect, useState } from "react";
import { 
  Package, Map, CheckCircle2, AlertCircle, 
  Users, Truck, DollarSign, Fuel, Plus, FileText, Loader2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatisticsCard } from "@/components/dashboard/statistics-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import Link from "next/link";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsData = await api.get('/dashboard/stats');
        setStats(statsData);

        // Fetch expenses to build real chart data
        const expensesData = await api.get('/expenses');
        const expList = expensesData || [];
        
        // Group by month
        const monthly = {
          'Jan': { revenue: 0, expenses: 0 },
          'Feb': { revenue: 0, expenses: 0 },
          'Mar': { revenue: 0, expenses: 0 },
          'Apr': { revenue: 0, expenses: 0 },
          'May': { revenue: 0, expenses: 0 },
          'Jun': { revenue: 0, expenses: 0 },
          'Jul': { revenue: 0, expenses: 0 },
        };
        
        expList.forEach((e: any) => {
          if (!e.date) return;
          const month = new Date(e.date).toLocaleString('default', { month: 'short' });
          if (monthly[month as keyof typeof monthly]) {
            monthly[month as keyof typeof monthly].expenses += parseFloat(e.amount);
          }
        });

        const realChartData = Object.keys(monthly).map(k => ({
          name: k,
          revenue: monthly[k as keyof typeof monthly].revenue,
          expenses: monthly[k as keyof typeof monthly].expenses,
        }));
        
        // Filter to only months up to current to avoid zero-filled future months if possible
        setChartData(realChartData);

      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back. Here is your operational overview.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/orders/create" className={buttonVariants({ variant: "default" })}><Plus className="mr-2 h-4 w-4" /> New Order</Link>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" /> Download Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatisticsCard 
          title="Total Orders" value={stats?.totalOrders || 0} icon={Package} 
        />
        <StatisticsCard 
          title="Active Trips" value={stats?.activeTrips || 0} icon={Map} 
        />
        <StatisticsCard 
          title="Available Drivers" value={stats?.availableDrivers || 0} icon={Users} 
        />
        <StatisticsCard 
          title="Available Vehicles" value={stats?.totalVehicles || 0} icon={Truck} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Revenue vs Expenses over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} dx={-10} tickFormatter={(value) => `$${value}`} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expenses" name="Expenses" fill="#E2E8F0" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest orders requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity: any) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(activity.time).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No recent activities
                </div>
              )}
            </div>
            <div className="mt-6">
              <Link href="/orders" className={buttonVariants({ variant: "outline", className: "w-full" })}>
                View All Orders
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
