"use client";

import { useEffect, useState } from "react";
import { 
  Package, Map, CheckCircle2, AlertCircle, 
  Users, Truck, DollarSign, Fuel, Plus, FileText, Loader2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatisticsCard } from "@/components/dashboard/statistics-card";
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

        const revenueTrend = await api.get('/analytics/revenue');
        
        // Format revenue trend for recharts
        const formattedChartData = (revenueTrend || []).map((item: any) => ({
          name: new Date(item.date).toLocaleDateString('default', { month: 'short', day: 'numeric' }),
          revenue: item.revenue,
          expenses: item.expenses
        }));
        
        setChartData(formattedChartData);

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
          <Link href="/reports" className={buttonVariants({ variant: "outline" })}>
            <FileText className="mr-2 h-4 w-4" /> View Reports
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatisticsCard 
          title="Revenue (Month)" value={`$${(stats?.revenue?.month || 0).toFixed(2)}`} icon={DollarSign} 
          description={`Today: $${(stats?.revenue?.today || 0).toFixed(2)} | Week: $${(stats?.revenue?.week || 0).toFixed(2)}`}
        />
        <StatisticsCard 
          title="Total Orders" value={stats?.orders?.total || 0} icon={Package} 
          description={`Pending: ${stats?.orders?.pending || 0} | Delivered: ${stats?.orders?.delivered || 0}`}
        />
        <StatisticsCard 
          title="Active Trips" value={stats?.trips?.active || 0} icon={Map} 
          description={`Completed: ${stats?.trips?.completed || 0} total trips`}
        />
        <StatisticsCard 
          title="Available Drivers" value={stats?.drivers?.available || 0} icon={Users} 
          description={`Total: ${stats?.drivers?.total || 0} | On Trip: ${stats?.drivers?.active || 0}`}
        />
        <StatisticsCard 
          title="Available Vehicles" value={stats?.vehicles?.available || 0} icon={Truck} 
          description={`Maintenance: ${stats?.vehicles?.maintenance || 0} | On Trip: ${stats?.vehicles?.active || 0}`}
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
