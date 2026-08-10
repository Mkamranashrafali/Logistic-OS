"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { useQuery } from "@tanstack/react-query";

export default function ArchivedDriversPage() {
  const { data: archivedDriversData, isPending } = useQuery({
    queryKey: ["drivers", "archived"],
    queryFn: async () => {
      const res = await api.get('/drivers?lifecycle_status=archived');
      return res || [];
    },
  });

  const archivedDrivers = archivedDriversData || [];

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Link href="/drivers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Archived Drivers</h1>
          <p className="text-muted-foreground">Historical records of archived drivers.</p>
        </div>
      </div>

      {(isPending && !archivedDriversData) ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : archivedDrivers.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card">
          <p className="text-muted-foreground">No archived drivers found.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Joined Date</th>
                  <th className="px-6 py-4 font-medium">Archived Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {archivedDrivers.map((driver: any) => (
                  <tr key={driver.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{driver.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{driver.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(driver.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {driver.terminated_at ? new Date(driver.terminated_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs font-semibold rounded-full">
                        Archived
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
