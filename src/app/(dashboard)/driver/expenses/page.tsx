"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Loader2, Fuel, Receipt, DollarSign, Calendar, MapPin, ExternalLink, Tag } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "@tanstack/react-query";

export default function DriverExpensesPage() {
  const { data, isPending } = useQuery({
    queryKey: ["driver-expenses-grouped"],
    queryFn: async () => {
      const [expensesData, tripsData] = await Promise.all([
        api.get('/driver/expenses'),
        api.get('/driver/trips').catch(() => [])
      ]);

      return {
        expenses: expensesData || [],
        trips: tripsData || []
      };
    },
  });

  const expenses = data?.expenses || [];
  const trips = data?.trips || [];

  if (isPending && !data) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Create a trip lookup map for fast trip details retrieval
  const tripMap = new Map<string, any>();
  trips.forEach((t: any) => tripMap.set(t.id, t));

  // Group expenses by trip_id
  const groupedExpenses = new Map<string, any[]>();
  const unassignedExpenses: any[] = [];

  expenses.forEach((exp: any) => {
    if (exp.trip_id) {
      if (!groupedExpenses.has(exp.trip_id)) {
        groupedExpenses.set(exp.trip_id, []);
      }
      groupedExpenses.get(exp.trip_id)!.push(exp);
    } else {
      unassignedExpenses.push(exp);
    }
  });

  const hasExpenses = expenses.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fuel & Expenses</h1>
        <p className="text-muted-foreground">Operational expense records and fuel logs structured by trip.</p>
      </div>

      {!hasExpenses ? (
        <EmptyState
          icon={Receipt}
          title="No fuel or expense records"
          description="You have not logged any fuel or operational expenses yet."
        />
      ) : (
        <div className="space-y-6">
          {/* Trip Grouped Expense Cards */}
          {Array.from(groupedExpenses.entries()).map(([tripId, tripExpenses]) => {
            const trip = tripMap.get(tripId);
            const totalTripExpenses = tripExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
            
            // Separate fuel records from other operational expenses
            const fuelEntries = tripExpenses.filter((e: any) => e.type?.toLowerCase() === 'fuel');
            const otherEntries = tripExpenses.filter((e: any) => e.type?.toLowerCase() !== 'fuel');

            return (
              <Card key={tripId} className="shadow-sm border">
                <CardHeader className="bg-muted/30 border-b pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg font-bold">
                        TRP-{tripId.substring(0, 8).toUpperCase()}
                      </CardTitle>
                      {trip ? (
                        <CardDescription className="text-xs flex items-center gap-1.5 mt-1 font-medium">
                          <span>{trip.origin || 'N/A'}</span>
                          <span>→</span>
                          <span>{trip.destination || 'N/A'}</span>
                        </CardDescription>
                      ) : (
                        <CardDescription className="text-xs">Trip Expense Records</CardDescription>
                      )}
                    </div>

                    <div className="bg-card px-3 py-1.5 rounded-lg border font-semibold text-sm">
                      Total: <span className="text-primary">${totalTripExpenses.toFixed(2)}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* FUEL SECTION */}
                  {fuelEntries.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Fuel className="h-4 w-4 text-amber-500" /> Fuel Records
                      </h4>
                      
                      <div className="grid gap-3 sm:grid-cols-2">
                        {fuelEntries.map((exp: any) => (
                          <div key={exp.id} className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg space-y-2">
                            <div className="flex items-start justify-between">
                              <span className="font-semibold text-base">${exp.amount.toFixed(2)}</span>
                              <span className="text-xs font-medium px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded">Fuel</span>
                            </div>
                            
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(exp.date).toLocaleString()}
                              </p>
                              {exp.station && <p><span className="font-medium text-foreground">Station:</span> {exp.station}</p>}
                              {exp.notes && <p className="italic">{exp.notes}</p>}
                            </div>

                            {exp.receipt_url && (
                              <a 
                                href={exp.receipt_url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="inline-flex items-center text-xs font-medium text-primary hover:underline pt-1"
                              >
                                View Receipt <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* OTHER EXPENSES SECTION */}
                  {otherEntries.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Receipt className="h-4 w-4 text-blue-500" /> Operational Expenses
                      </h4>
                      
                      <div className="grid gap-3 sm:grid-cols-2">
                        {otherEntries.map((exp: any) => (
                          <div key={exp.id} className="p-3 bg-card border rounded-lg space-y-2">
                            <div className="flex items-start justify-between">
                              <span className="font-semibold text-base">${exp.amount.toFixed(2)}</span>
                              <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded flex items-center gap-1">
                                <Tag className="h-3 w-3 text-muted-foreground" />
                                {exp.type}
                              </span>
                            </div>

                            <div className="text-xs text-muted-foreground space-y-1">
                              <p className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(exp.date).toLocaleString()}
                              </p>
                              {exp.notes && <p className="text-foreground">{exp.notes}</p>}
                            </div>

                            {exp.receipt_url && (
                              <a 
                                href={exp.receipt_url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="inline-flex items-center text-xs font-medium text-primary hover:underline pt-1"
                              >
                                View Receipt <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Unassigned / General Expenses */}
          {unassignedExpenses.length > 0 && (
            <Card className="shadow-sm border">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <CardTitle className="text-lg font-bold">General Operational Expenses</CardTitle>
                <CardDescription className="text-xs">Expenses logged without explicit trip associations</CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  {unassignedExpenses.map((exp: any) => (
                    <div key={exp.id} className="p-3 bg-card border rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-base">${exp.amount.toFixed(2)}</span>
                        <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded">{exp.type}</span>
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1">
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(exp.date).toLocaleString()}
                        </p>
                        {exp.notes && <p className="text-foreground">{exp.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
