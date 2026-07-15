"use client";

import { 
  Package, Map, CheckCircle2, AlertCircle, 
  Users, Truck, DollarSign, Fuel, Plus, FileText, Settings 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatisticsCard } from "@/components/dashboard/statistics-card";
import { MOCK_STATS, MOCK_CHART_DATA, MOCK_ORDERS } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import Link from "next/link";

export default function DashboardPage() {
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
          title="Total Orders" value={MOCK_STATS.totalOrders} icon={Package} 
          description="+12% from last month" trend="up" 
        />
        <StatisticsCard 
          title="Active Trips" value={MOCK_STATS.activeTrips} icon={Map} 
          description="5 delayed" trend="down" 
        />
        <StatisticsCard 
          title="Completed Trips" value={MOCK_STATS.completedTrips} icon={CheckCircle2} 
          description="+8% from last month" trend="up" 
        />
        <StatisticsCard 
          title="Delayed Trips" value={MOCK_STATS.delayedTrips} icon={AlertCircle} 
          description="-2% from last month" trend="down" 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatisticsCard title="Available Drivers" value={MOCK_STATS.availableDrivers} icon={Users} />
        <StatisticsCard title="Available Vehicles" value={MOCK_STATS.availableVehicles} icon={Truck} />
        <StatisticsCard title="Pending Payments" value={MOCK_STATS.pendingPayments} icon={DollarSign} />
        <StatisticsCard title="Fuel Expenses" value={MOCK_STATS.fuelExpenses} icon={Fuel} />
      </div>

      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Revenue vs Expenses over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_DATA}>
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
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {MOCK_ORDERS.slice(0, 4).map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">{order.pickup} → {order.destination}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={order.status} />
                    <p className="text-xs text-muted-foreground mt-1">{order.deliveryDate}</p>
                  </div>
                </div>
              ))}
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


