"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { api } from "@/lib/api";
import { Loader2, Play, Pause, Square, MapPin, Truck, Clock, DollarSign, Activity, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function DriverDashboardPage() {
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["driver-dashboard"],
    queryFn: async () => {
      const [tripsData, activitiesData, profileData] = await Promise.all([
        api.get('/driver/trips'),
        api.get('/driver/activities'),
        api.get('/driver/profile').catch(() => null)
      ]);

      return {
        trips: tripsData || [],
        activities: activitiesData || [],
        profile: profileData || null,
      };
    },
  });

  const trips = data?.trips || [];
  const activities = data?.activities || [];
  const profile = data?.profile || null;

  // Active/Assigned Trip selection logic
  const activeTrip = trips.find((t: any) => 
    t.trip_status === 'created' || 
    t.trip_status === 'started' || 
    t.trip_status === 'PAUSED' || 
    t.id === profile?.current_trip_id
  ) || (trips.length > 0 && trips[0].trip_status !== 'completed' && trips[0].trip_status !== 'cancelled' ? trips[0] : null);

  // Expense Modal State
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState("Toll");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseNotes, setExpenseNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const EXPENSE_CATEGORIES = ["Fuel", "Toll", "Parking", "Loading", "Unloading", "Repair", "Food", "Hotel", "Fine", "Delivery Proof", "Other"];

  const [tripActionLoading, setTripActionLoading] = useState(false);

  const handleTripAction = async (action: 'start' | 'pause' | 'resume' | 'complete', tripId: string) => {
    if (tripActionLoading) return;
    setTripActionLoading(true);
    try {
      await api.post(`/driver/trips/${tripId}/${action}`, {});
      queryClient.invalidateQueries({ queryKey: ["driver-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["driver-trips"] });
    } catch (err: any) {
      alert(err.message || `Failed to ${action} trip`);
    } finally {
      setTripActionLoading(false);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.post('/driver/expenses', {
        trip_id: activeTrip.id,
        category: expenseCategory,
        amount: expenseCategory === "Delivery Proof" ? 0.0 : parseFloat(expenseAmount),
        notes: expenseNotes,
      });
      setIsExpenseOpen(false);
      setExpenseAmount(""); 
      setExpenseNotes(""); 
      setExpenseCategory("Toll");
      queryClient.invalidateQueries({ queryKey: ["driver-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["driver-expenses"] });
    } catch (err: any) {
      alert(err.message || "Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending && !data) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Driver Portal</h1>
          <p className="text-muted-foreground">Manage your current operational assignment and activity status.</p>
        </div>
      </div>

      {/* SECTION 1: CURRENT OPERATION / ASSIGNED TRIP CARD */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Current Operation</h2>
          {activeTrip && (
            <Link 
              href="/driver/trips" 
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              View Trip History <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <Card className="shadow-md border-primary/20 bg-card overflow-hidden">
          {activeTrip ? (
            <div>
              <CardHeader className="bg-muted/30 border-b pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">
                        TRP-{activeTrip.id.substring(0, 8).toUpperCase()}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Assigned Operational Trip
                      </CardDescription>
                    </div>
                  </div>
                  <StatusBadge status={activeTrip.trip_status} />
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Route Visualizer */}
                <div className="bg-muted/40 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shrink-0 ring-4 ring-blue-500/20" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Origin</p>
                      <p className="font-semibold text-base">{activeTrip.origin || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center text-muted-foreground shrink-0 px-4">
                    <div className="h-[2px] w-12 bg-border relative">
                      <div className="absolute -top-1.5 right-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-border" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 flex-1">
                    <MapPin className="h-4 w-4 text-red-500 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Destination</p>
                      <p className="font-semibold text-base">{activeTrip.destination || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Trip Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pt-2">
                  <div className="p-3 bg-card border rounded-lg">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Truck className="h-3.5 w-3.5 text-primary" /> Assigned Vehicle
                    </p>
                    <p className="font-semibold text-foreground truncate">
                      {profile?.assigned_vehicle?.name || profile?.assigned_vehicle?.plate_number || 'Vehicle Assigned'}
                    </p>
                  </div>

                  <div className="p-3 bg-card border rounded-lg">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Clock className="h-3.5 w-3.5 text-primary" /> Start Time
                    </p>
                    <p className="font-semibold text-foreground truncate">
                      {activeTrip.start_time ? new Date(activeTrip.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not started'}
                    </p>
                  </div>

                  <div className="p-3 bg-card border rounded-lg">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> Current Location
                    </p>
                    <p className="font-semibold text-foreground truncate">
                      {activeTrip.current_location || 'En route'}
                    </p>
                  </div>

                  <div className="p-3 bg-card border rounded-lg">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Activity className="h-3.5 w-3.5 text-primary" /> Distance
                    </p>
                    <p className="font-semibold text-foreground truncate">
                      {activeTrip.distance_travelled ? `${activeTrip.distance_travelled} km` : '0 km'}
                    </p>
                  </div>
                </div>

                {/* Operational Controls & Actions */}
                <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {activeTrip.trip_status === 'created' && (
                      <Button disabled={tripActionLoading} onClick={() => handleTripAction('start', activeTrip.id)}>
                        {tripActionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />} 
                        Start Trip
                      </Button>
                    )}

                    {activeTrip.trip_status === 'started' && (
                      <>
                        <Button disabled={tripActionLoading} variant="secondary" onClick={() => handleTripAction('pause', activeTrip.id)}>
                          {tripActionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Pause className="h-4 w-4 mr-2" />} 
                          Pause Trip
                        </Button>
                        <Button disabled={tripActionLoading} variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleTripAction('complete', activeTrip.id)}>
                          {tripActionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Square className="h-4 w-4 mr-2" />} 
                          Complete Trip
                        </Button>
                      </>
                    )}

                    {activeTrip.trip_status === 'PAUSED' && (
                      <Button disabled={tripActionLoading} variant="default" onClick={() => handleTripAction('resume', activeTrip.id)}>
                        {tripActionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />} 
                        Resume Trip
                      </Button>
                    )}

                    {(activeTrip.trip_status === 'started' || activeTrip.trip_status === 'PAUSED') && (
                      <Dialog open={isExpenseOpen} onOpenChange={setIsExpenseOpen}>
                        <DialogTrigger className={buttonVariants({ variant: "outline" })}>
                          <DollarSign className="h-4 w-4 mr-1" /> Log Expense
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Log Trip Expense</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleExpenseSubmit} className="space-y-4 pt-2">
                            <div className="grid gap-2">
                              <Label>Category</Label>
                              <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={expenseCategory}
                                onChange={e => setExpenseCategory(e.target.value)}
                              >
                                {EXPENSE_CATEGORIES.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>

                            {expenseCategory !== "Delivery Proof" && (
                              <div className="grid gap-2">
                                <Label>Amount ($)</Label>
                                <Input required type="number" step="0.01" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} placeholder="0.00" />
                              </div>
                            )}

                            <div className="grid gap-2">
                              <Label>Notes / Description</Label>
                              <Input value={expenseNotes} onChange={e => setExpenseNotes(e.target.value)} placeholder="Optional details..." />
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                              {expenseCategory === "Delivery Proof" ? "Upload Proof" : "Save Expense"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  <Link href="/driver/trips">
                    <Button variant="ghost" size="sm">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </div>
          ) : (
            <CardContent className="p-6">
              <EmptyState
                icon={Truck}
                title="No active trip"
                description="You currently have no assigned trip."
              />
            </CardContent>
          )}
        </Card>
      </div>

      {/* RECENT ACTIVITY TIMELINE */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.slice(0, 5).map((act: any) => (
                  <div key={act.id} className="flex items-start gap-4">
                    <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-primary shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold capitalize">
                        {act.action_type.replace(/_/g, ' ').toLowerCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(act.timestamp).toLocaleString()}
                      </p>
                      {act.notes && (
                        <p className="text-xs mt-1 text-muted-foreground bg-muted/40 p-2 rounded border">
                          {act.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No recent activity recorded.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
