"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { api } from "@/lib/api";
import { Loader2, Play, Pause, Square, MapPin } from "lucide-react";

export default function DriverDashboardPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  // Expense State
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState("Toll");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseNotes, setExpenseNotes] = useState("");
  
  const EXPENSE_CATEGORIES = ["Fuel", "Toll", "Parking", "Loading", "Unloading", "Repair", "Food", "Hotel", "Fine", "Delivery Proof", "Other"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const tripsData = await api.get('/driver/trips');
      setTrips(tripsData || []);
      
      const activitiesData = await api.get('/driver/activities');
      setActivities(activitiesData || []);
    } catch (err) {
      console.error("Failed to fetch driver data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTripAction = async (action: 'start' | 'pause' | 'resume' | 'complete', tripId: string) => {
    try {
      await api.post(`/driver/trips/${tripId}/${action}`, {});
      fetchData();
    } catch (err: any) {
      alert(err.message || `Failed to ${action} trip`);
    }
  };



  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return;
    try {
      await api.post('/driver/expenses', {
        trip_id: activeTrip.id,
        category: expenseCategory,
        amount: expenseCategory === "Delivery Proof" ? 0.0 : parseFloat(expenseAmount),
        notes: expenseNotes,
      });
      setIsExpenseOpen(false);
      setExpenseAmount(""); setExpenseNotes(""); setExpenseCategory("Toll");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to add expense");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeTrip = trips.length > 0 ? trips[0] : null;

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Driver Portal</h1>
          <p className="text-muted-foreground">Manage your current trip, fuel entries, and view activities.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Current Assignment</CardTitle>
            <CardDescription>Your currently assigned trip</CardDescription>
          </CardHeader>
          <CardContent>
            {activeTrip ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                      <span className="font-medium">{activeTrip.origin || 'N/A'}</span>
                    </div>
                    <div className="border-l-2 border-dashed h-4 ml-1.5 border-muted-foreground/30"></div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-red-500" />
                      <span className="font-medium">{activeTrip.destination || 'N/A'}</span>
                    </div>
                  </div>
                  <StatusBadge status={activeTrip.trip_status} />
                </div>
                
                <div className="pt-4 border-t flex flex-wrap gap-2">
                  {activeTrip.trip_status === 'created' && (
                    <Button onClick={() => handleTripAction('start', activeTrip.id)}>
                      <Play className="h-4 w-4 mr-2" /> Start Trip
                    </Button>
                  )}
                  {activeTrip.trip_status === 'started' && (
                    <>
                      <Button variant="secondary" onClick={() => handleTripAction('pause', activeTrip.id)}>
                        <Pause className="h-4 w-4 mr-2" /> Pause
                      </Button>
                      <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => handleTripAction('complete', activeTrip.id)}>
                        <Square className="h-4 w-4 mr-2" /> Complete Trip
                      </Button>
                    </>
                  )}
                  {activeTrip.trip_status === 'PAUSED' && (
                    <Button variant="secondary" onClick={() => handleTripAction('resume', activeTrip.id)}>
                      <Play className="h-4 w-4 mr-2" /> Resume
                    </Button>
                  )}
                  {activeTrip.trip_status === 'completed' && (
                    <span className="text-sm text-muted-foreground font-medium">Trip Completed</span>
                  )}
                </div>
                
                {/* Additional Actions */}
                {activeTrip.trip_status === 'started' || activeTrip.trip_status === 'PAUSED' ? (
                  <div className="pt-4 border-t flex flex-wrap gap-2">
                    <Dialog open={isExpenseOpen} onOpenChange={setIsExpenseOpen}>
                      <DialogTrigger className={buttonVariants({ variant: "outline" })}>
                        Add Expense
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Log Expense</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleExpenseSubmit} className="space-y-4">
                          <div className="grid gap-2">
                            <Label>Category</Label>
                            <select 
                              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                              <Input required type="number" step="0.01" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} />
                            </div>
                          )}

                          <div className="grid gap-2">
                            <Label>Notes / Description</Label>
                            <Input value={expenseNotes} onChange={e => setExpenseNotes(e.target.value)} />
                          </div>

                          <div className="grid gap-2">
                            <Label>{expenseCategory === "Delivery Proof" ? "Signed POD / Image" : "Receipt Image"}</Label>
                            <Input type="file" />
                          </div>

                          <Button type="submit" className="w-full">
                            {expenseCategory === "Delivery Proof" ? "Upload Proof" : "Save Expense"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>


                  </div>
                ) : null}
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                <p>No active trips assigned.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>Recent events and logs</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium">{act.action_type.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(act.timestamp).toLocaleString()}
                      </p>
                      {act.notes && (
                        <p className="text-xs mt-1 text-muted-foreground">{act.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                <p>No recent activity.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
