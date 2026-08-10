"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Filter, MoreVertical, Loader2, MapPin, Map, CircleDollarSign, Fuel, Receipt, TrendingUp, TrendingDown, Navigation, CalendarClock, Trash2, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";

import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function TripsPage() {
  const queryClient = useQueryClient();

  const { data: tripsData, isPending } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const res = await api.get('/trips');
      return res || [];
    },
  });

  const trips = tripsData || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleComplete = async (id: string) => {
    if (!confirm("Mark this trip as completed?")) return;
    try {
      await api.patch(`/trips/${id}`, { trip_status: "completed" });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    } catch (err) {
      console.error("Failed to complete trip", err);
      alert("Failed to complete trip");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      await api.delete(`/trips/${id}`);
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    } catch (err) {
      console.error("Failed to delete trip", err);
      alert("Failed to delete trip");
    }
  };

  const filteredTrips = trips.filter((trip: any) => {
    const searchStr = `${trip.origin || ""} ${trip.destination || ""}`.toLowerCase();
    const matchesSearch = searchTerm === "" || searchStr.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || trip.trip_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in-50 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Fleet Trips</h1>
          <p className="text-muted-foreground mt-1">Command center for ongoing operations and historical routes.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card/60 backdrop-blur-md p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search routes (e.g. Lahore to Islamabad)..."
            className="pl-10 bg-background/50 border-border/50 h-11 rounded-xl w-full focus-visible:ring-primary/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
            <SelectTrigger className="bg-background/50 border-border/50 h-11 rounded-xl">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Operations</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="started">In Transit</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {(isPending && !tripsData) ? (
          <div className="flex justify-center items-center h-64 bg-card/30 rounded-3xl border border-border/50 border-dashed">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                <Navigation className="absolute inset-0 m-auto h-5 w-5 text-primary animate-pulse" />
              </div>
              <p className="text-muted-foreground font-medium">Tracking fleet operations...</p>
            </div>
          </div>
        ) : filteredTrips.length === 0 ? (
          <EmptyState
            title="No routes found"
            description={searchTerm || statusFilter !== "all" ? "Adjust your search filters to find what you're looking for." : "You haven't recorded any operations yet."}
            icon={Map}
            className="bg-card/30 rounded-3xl border border-border/50 border-dashed py-16"
          />
        ) : (
          <div className="grid gap-5">
            {filteredTrips.map((trip: any) => {
              const isProfitable = (trip.net_profit || 0) >= 0;
              const margin = trip.profit_margin || 0;
              
              return (
                <Card key={trip.id} className="group overflow-hidden relative border-border/50 hover:border-primary/40 hover:shadow-xl transition-all duration-500 rounded-2xl bg-gradient-to-br from-card to-card/50">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <div className="p-5 sm:p-6 relative z-10 flex flex-col xl:flex-row gap-6 items-center">
                    
                    {/* Route & Basic Info */}
                    <div className="flex-1 w-full flex gap-5">
                      <div className="flex flex-col items-center justify-between py-2">
                        <div className="relative">
                          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)] z-10 relative" />
                          <div className="absolute inset-0 w-3 h-3 rounded-full bg-blue-500 animate-ping opacity-50" />
                        </div>
                        <div className="w-0.5 h-12 bg-gradient-to-b from-blue-500 via-primary/50 to-red-500 rounded-full my-1 opacity-70" />
                        <MapPin className="w-4 h-4 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      </div>
                      
                      <div className="flex flex-col justify-between h-full py-1 w-full">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-lg leading-none">{trip.origin || 'Unknown Origin'}</h3>
                            <span className="text-xs font-mono text-muted-foreground/60 hidden sm:block">#{trip.id.substring(0, 8)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CalendarClock className="w-3 h-3" />
                            <span>{trip.start_time ? new Date(trip.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending Start'}</span>
                          </div>
                        </div>
                        <div className="mt-6">
                          <h3 className="font-bold text-lg leading-none">{trip.destination || 'Unknown Destination'}</h3>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Navigation className="w-3 h-3" />
                            <span>{trip.distance_travelled ? `${trip.distance_travelled} km` : '0 km'} • {trip.end_time ? new Date(trip.end_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending Arrival'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Financial Stats Grid */}
                    <div className="flex-[1.5] w-full grid grid-cols-2 sm:grid-cols-4 gap-3 bg-background/50 p-4 rounded-xl border border-border/40">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <CircleDollarSign className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium uppercase tracking-wider">Deal Price</span>
                        </div>
                        <span className="font-semibold text-foreground">${(trip.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <Fuel className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-xs font-medium uppercase tracking-wider">Fuel Cost</span>
                        </div>
                        <span className="font-semibold text-amber-600 dark:text-amber-500">${(trip.fuel_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <Receipt className="w-3.5 h-3.5 text-orange-500" />
                          <span className="text-xs font-medium uppercase tracking-wider">Other Exp</span>
                        </div>
                        <span className="font-semibold text-orange-600 dark:text-orange-500">${(trip.other_expenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-[10px] bg-destructive/10 text-destructive rounded-full">Σ</span>
                          <span className="text-xs font-medium uppercase tracking-wider">Total Cost</span>
                        </div>
                        <span className="font-semibold text-destructive">${(trip.total_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* Profit & Margin */}
                    <div className="flex-1 w-full flex flex-row xl:flex-col items-center xl:items-end justify-between xl:justify-center border-t xl:border-t-0 xl:border-l border-border/50 pt-4 xl:pt-0 xl:pl-6">
                      <div className="flex flex-col items-start xl:items-end">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Net Profit</p>
                        <div className="flex items-center gap-2">
                          {isProfitable ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-destructive" />}
                          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isProfitable ? 'text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-destructive drop-shadow-[0_0_10px_rgba(220,38,38,0.2)]'}`}>
                            ${(trip.net_profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </h2>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1 mt-0 xl:mt-3 w-32 sm:w-40">
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-[10px] font-medium text-muted-foreground uppercase">Margin</span>
                          <span className={`text-xs font-bold ${isProfitable ? 'text-emerald-500' : 'text-destructive'}`}>{margin.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${isProfitable ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-destructive/50 to-destructive'}`} 
                            style={{ width: `${Math.min(Math.max(margin, 0), 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions & Status */}
                    <div className="flex flex-row xl:flex-col items-center justify-between xl:justify-center gap-4 w-full xl:w-auto mt-4 xl:mt-0">
                      <StatusBadge status={trip.trip_status} />
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-background/50 border border-border/50 hover:bg-muted hover:shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuLabel>Route Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {trip.trip_status !== 'completed' && (
                            <DropdownMenuItem onClick={() => handleComplete(trip.id)} className="gap-2 cursor-pointer">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span>Mark as Completed</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(trip.id)} className="text-destructive gap-2 cursor-pointer focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Route</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
