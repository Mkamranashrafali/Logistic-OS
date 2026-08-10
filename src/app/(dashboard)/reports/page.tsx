"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { api } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatisticsCard } from "@/components/dashboard/statistics-card";
import { useQuery } from "@tanstack/react-query";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("30days");
  const [activeTab, setActiveTab] = useState("revenue");

  const { data: reportsData, isPending } = useQuery({
    queryKey: ["reports", activeTab, dateRange],
    queryFn: async () => {
      let startDateStr = "";
      const now = new Date();
      if (dateRange === "today") {
        now.setHours(0, 0, 0, 0);
        startDateStr = now.toISOString();
      } else if (dateRange === "7days") {
        now.setDate(now.getDate() - 7);
        startDateStr = now.toISOString();
      } else if (dateRange === "30days") {
        now.setDate(now.getDate() - 30);
        startDateStr = now.toISOString();
      } else if (dateRange === "month") {
        now.setDate(1);
        now.setHours(0, 0, 0, 0);
        startDateStr = now.toISOString();
      }

      const queryParams = startDateStr ? `?start_date=${encodeURIComponent(startDateStr)}` : '';

      let rev: any[] = [];
      let trip: any = {};
      let fuel: any = {};
      let driver: any[] = [];
      let vehicle: any[] = [];
      let customer: any[] = [];

      if (activeTab === "revenue") {
        const res = await api.get(`/analytics/revenue${queryParams}`);
        rev = (res || []).map((item: any) => ({
          name: new Date(item.date).toLocaleDateString('default', { month: 'short', day: 'numeric' }),
          revenue: item.revenue,
          expenses: item.expenses
        }));
      } else if (activeTab === "trips") {
        trip = (await api.get(`/analytics/trips${queryParams}`)) || {};
      } else if (activeTab === "fuel") {
        fuel = (await api.get(`/analytics/fuel${queryParams}`)) || {};
      } else if (activeTab === "drivers") {
        driver = (await api.get(`/analytics/drivers${queryParams}`)) || [];
      } else if (activeTab === "vehicles") {
        vehicle = (await api.get(`/analytics/vehicles${queryParams}`)) || [];
      } else if (activeTab === "customers") {
        customer = (await api.get(`/analytics/customers${queryParams}`)) || [];
      }

      return {
        revenueData: rev,
        tripData: trip,
        fuelData: fuel,
        driverData: driver,
        vehicleData: vehicle,
        customerData: customer,
      };
    },
  });

  const revenueData = reportsData?.revenueData || [];
  const tripData = reportsData?.tripData || {};
  const fuelData = reportsData?.fuelData || {};
  const driverData = reportsData?.driverData || [];
  const vehicleData = reportsData?.vehicleData || [];
  const customerData = reportsData?.customerData || [];
  const isLoading = isPending && !reportsData;

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground">Comprehensive insights into operations and financials.</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={(val) => setDateRange(val || "7d")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val || "overview")} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full lg:w-3/4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="trips">Trips</TabsTrigger>
          <TabsTrigger value="fuel">Fuel</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <TabsContent value="revenue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue & Expenses Trend</CardTitle>
                  <CardDescription>Daily financial performance for the selected period.</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} dx={-10} tickFormatter={(value) => `$${value}`} />
                      <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#94A3B8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trips" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Trips</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{tripData?.total_trips || 0}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Delayed Trips</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{tripData?.delayed_trips || 0}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Avg Cost / Trip</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">${(tripData?.average_cost_per_trip || 0).toFixed(2)}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Avg Profit / Trip</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">${(tripData?.average_profit_per_trip || 0).toFixed(2)}</div></CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="fuel" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Fuel Cost By Vehicle</CardTitle>
                    <CardDescription>Top vehicles by fuel consumption.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fuelData?.by_vehicle || []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                        <YAxis dataKey="vehicle" type="category" width={100} />
                        <Tooltip cursor={{ fill: '#F1F5F9' }} />
                        <Bar dataKey="cost" name="Fuel Cost" fill="#F59E0B" radius={[0, 4, 4, 0]} maxBarSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Fuel Cost By Driver</CardTitle>
                    <CardDescription>Drivers with highest fuel expenses.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fuelData?.by_driver || []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                        <YAxis dataKey="driver" type="category" width={100} />
                        <Tooltip cursor={{ fill: '#F1F5F9' }} />
                        <Bar dataKey="cost" name="Fuel Cost" fill="#3B82F6" radius={[0, 4, 4, 0]} maxBarSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="drivers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Driver Performance Leaderboard</CardTitle>
                  <CardDescription>Based on completed orders and total revenue generated.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {driverData.length > 0 ? driverData.map((d: any, idx: number) => (
                      <div key={d.driver_id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            #{idx + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold">{d.name}</h4>
                            <p className="text-sm text-muted-foreground">{d.completed_orders} / {d.total_orders} Orders Completed</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-success">${d.revenue_generated.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">Score: {d.performance_score}%</p>
                        </div>
                      </div>
                    )) : <p className="text-muted-foreground py-4 text-center">No driver data available for this period.</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vehicles" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Utilization & Status</CardTitle>
                  <CardDescription>Current state of the fleet.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicleData.length > 0 ? vehicleData.map((v: any) => (
                      <div key={v.vehicle_id} className="p-4 border rounded-lg flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold">{v.license_plate}</h4>
                          <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${v.status === 'available' ? 'bg-success/10 text-success' :
                              v.status === 'on_trip' ? 'bg-primary/10 text-primary' :
                                'bg-destructive/10 text-destructive'
                            }`}>
                            {v.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        {v.maintenance_due && (
                          <div className="mt-4 text-xs text-destructive flex items-center font-medium">
                            <span className="w-2 h-2 rounded-full bg-destructive mr-2" /> Maintenance Due
                          </div>
                        )}
                      </div>
                    )) : <p className="col-span-full text-center text-muted-foreground py-4">No vehicle data found.</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Customers by Revenue</CardTitle>
                  <CardDescription>Highest value clients in the selected period.</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={customerData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                      <YAxis tickFormatter={(v) => `$${v}`} axisLine={false} tickLine={false} dx={-10} />
                      <Tooltip cursor={{ fill: '#F1F5F9' }} />
                      <Bar dataKey="total_revenue" name="Total Revenue" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
