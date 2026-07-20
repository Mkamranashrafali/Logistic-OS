"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FormerDriversPage() {
  const [terminatedDrivers, setTerminatedDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFormerDrivers();
  }, []);

  const fetchFormerDrivers = async () => {
    try {
      setIsLoading(true);
      // We can reuse the drivers endpoint and filter by lifecycle_status, 
      // or if include_deleted=true returns terminated drivers.
      // Our recent backend update sets lifecycle_status to "terminated".
      const data = await api.get('/drivers');
      const terminated = (data || []).filter((d: any) => d.lifecycle_status === 'terminated');
      setTerminatedDrivers(terminated);
    } catch (err) {
      console.error("Failed to fetch former drivers", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Link href="/drivers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Former Drivers</h1>
          <p className="text-muted-foreground">Historical records of terminated drivers.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : terminatedDrivers.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card">
          <p className="text-muted-foreground">No former drivers found.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Company ID</th>
                  <th className="px-6 py-4 font-medium">Joined Date</th>
                  <th className="px-6 py-4 font-medium">Leaving Date</th>
                  <th className="px-6 py-4 font-medium">Reason</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {terminatedDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{driver.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{driver.company_id}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(driver.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {driver.terminated_at ? new Date(driver.terminated_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {driver.termination_reason || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs font-semibold rounded-full">
                        Terminated
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
