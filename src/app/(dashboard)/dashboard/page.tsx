"use client";

import {
  Package, Map, CheckCircle2, AlertCircle,
  Users, Truck, Fuel, Plus, FileText, Loader2, ArrowRight, TrendingUp, Clock, PieChart as PieChartIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { StatisticsCard } from "@/components/dashboard/statistics-card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts";
import Link from "next/link";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const { data, isPending } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [statsData, revenueTrend] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/analytics/revenue')
      ]);

      const formattedChartData = (revenueTrend || []).map((item: any) => ({
        name: new Date(item.date).toLocaleDateString('default', { month: 'short', day: 'numeric' }),
        revenue: item.revenue,
        expenses: item.expenses
      }));

      return {
        stats: statsData,
        chartData: formattedChartData,
      };
    },
  });

  const stats = data?.stats;
  const chartData = data?.chartData || [];

  // Data for Fleet Distribution Pie Chart
  const fleetDistributionData = [
    { name: 'Vehicles Busy', value: stats?.vehicles?.active || 0, color: '#6366f1' },
    { name: 'Vehicles Available', value: stats?.vehicles?.available || 0, color: '#10b981' },
    { name: 'Maintenance', value: stats?.vehicles?.maintenance || 0, color: '#f59e0b' },
  ];

  if (isPending && !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading operational insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Executive Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-muted/50 via-card to-card p-6 rounded-2xl border shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Executive Operational Overview
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time operational metrics, resource availability, and activity trends.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/orders/create" className={buttonVariants({ variant: "default", className: "shadow-sm" })}>
            <Plus className="mr-2 h-4 w-4" /> New Order
          </Link>
          <Link href="/planning" className={buttonVariants({ variant: "outline" })}>
            <Map className="mr-2 h-4 w-4" /> Planning Queue
          </Link>
        </div>
      </div>

      {/* 5-Column Responsive KPI Metrics Cards Grid (Revenue Card Removed) */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <StatisticsCard
          title="Waiting Assignment" 
          value={stats?.orders?.planning || 0} 
          icon={Package}
          iconColor="text-amber-600"
          iconBg="bg-amber-500/10"
          description="Requires planning"
        />
        <StatisticsCard
          title="Drivers Busy" 
          value={stats?.drivers?.active || 0} 
          icon={Users}
          iconColor="text-sky-600"
          iconBg="bg-sky-500/10"
          description={`Available: ${stats?.drivers?.available || 0} | Total: ${stats?.drivers?.total || 0}`}
        />
        <StatisticsCard
          title="Vehicles Busy" 
          value={stats?.vehicles?.active || 0} 
          icon={Truck}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-500/10"
          description={`Available: ${stats?.vehicles?.available || 0} | Maint: ${stats?.vehicles?.maintenance || 0}`}
        />
        <StatisticsCard
          title="Total Orders" 
          value={stats?.orders?.total || 0} 
          icon={FileText}
          iconColor="text-teal-600"
          iconBg="bg-teal-500/10"
          description={`Pending: ${stats?.orders?.pending || 0} | Delivered: ${stats?.orders?.delivered || 0}`}
        />
        <StatisticsCard
          title="Active Trips" 
          value={stats?.trips?.active || 0} 
          icon={Map}
          iconColor="text-rose-600"
          iconBg="bg-rose-500/10"
          description={`Completed: ${stats?.trips?.completed || 0} trips`}
        />
      </div>

      {/* Animated Charts & Visualizers Section */}
      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">
        {/* Animated AreaChart with SVG Gradients */}
        <Card className="col-span-full lg:col-span-4 shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold">Operational Performance Trends</CardTitle>
              <CardDescription>Smooth animated revenue vs expense trajectory over time</CardDescription>
            </div>
            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="h-[360px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }} 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08)', backgroundColor: 'hsl(var(--card))' }} 
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '16px' }} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  name="Expenses" 
                  stroke="#f43f5e" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorExpenses)" 
                  activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fleet Resource Utilization Donut Chart */}
        <Card className="col-span-full lg:col-span-3 shadow-sm border flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold">Fleet Allocation</CardTitle>
                <CardDescription>Live vehicle capacity & status breakdown</CardDescription>
              </div>
              <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                <PieChartIcon className="h-4 w-4 text-indigo-500" />
              </div>
            </CardHeader>
            <CardContent className="h-[260px] pt-2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fleetDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {fleetDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                  />
                  <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </div>

          <CardContent className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>Total Fleet Vehicles: <strong className="text-foreground">{stats?.vehicles?.total || 0}</strong></span>
              <Link href="/vehicles" className="text-primary font-medium hover:underline flex items-center gap-1">
                Manage Fleet <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Operational Activity Stream</h2>
        <Card className="shadow-sm border">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity: any) => (
                  <div key={activity.id} className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(activity.time).toLocaleString()}</p>
                      </div>
                    </div>
                    <Link href="/orders" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                      View Order
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No recent activities recorded.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
