"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Loader2 } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { api } from "@/lib/api";

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/dashboard/stats');
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats for reports", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Jan', revenue: 0, expenses: 0 },
    { name: 'Feb', revenue: 0, expenses: 0 },
    { name: 'Mar', revenue: stats?.revenue || 0, expenses: 0 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Download and view operational analytics.</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" /> Export Data
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-full">
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
          
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>Recently generated analytical reports.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No custom reports generated yet.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
