"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Filter, MoreHorizontal, Loader2, MapPin, Map } from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const data = await api.get('/trips');
      setTrips(data || []);
    } catch (err) {
      console.error("Failed to fetch trips", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (id: string) => {
    if (!confirm("Mark this trip as completed?")) return;
    try {
      await api.patch(`/trips/${id}`, { trip_status: "completed" });
      fetchTrips();
    } catch (err) {
      console.error("Failed to complete trip", err);
      alert("Failed to complete trip");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      await api.delete(`/trips/${id}`);
      fetchTrips();
    } catch (err) {
      console.error("Failed to delete trip", err);
      alert("Failed to delete trip");
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const searchStr = `${trip.origin || ""} ${trip.destination || ""}`.toLowerCase();
    const matchesSearch = searchTerm === "" || searchStr.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || trip.trip_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trips</h1>
          <p className="text-muted-foreground">Monitor ongoing trips and view past trip histories.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search trips by location..." 
            className="pl-9 bg-background w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="started">Started</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Route</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Deal Price</TableHead>
                <TableHead>Fuel Cost</TableHead>
                <TableHead>Other Exp.</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredTrips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="p-0">
                    <EmptyState 
                      title="No trips found" 
                      description={searchTerm || statusFilter !== "all" ? "No trips match your current filters." : "You haven't recorded any trips yet."} 
                      icon={Map}
                      className="border-0 rounded-none bg-transparent"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrips.map((trip) => (
                  <TableRow key={trip.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm font-medium">
                          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 shrink-0" />
                          <span className="truncate max-w-[120px]" title={trip.origin}>{trip.origin || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1 shrink-0" />
                          <span className="truncate max-w-[120px]" title={trip.destination}>{trip.destination || 'N/A'}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground/50 truncate w-24">#{trip.id.slice(0, 8)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{trip.start_time ? new Date(trip.start_time).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-sm">{trip.end_time ? new Date(trip.end_time).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-sm">{trip.distance_travelled ? `${trip.distance_travelled} km` : '0 km'}</TableCell>
                    <TableCell className="text-sm font-medium text-green-600">${(trip.revenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">${(trip.fuel_cost || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">${(trip.other_expenses || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-sm font-medium text-red-500">${(trip.total_cost || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-sm font-medium">${(trip.net_profit || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-sm">{trip.profit_margin ? `${trip.profit_margin.toFixed(1)}%` : '0%'}</TableCell>
                    <TableCell>
                      <StatusBadge status={trip.trip_status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {trip.trip_status !== 'completed' && (
                            <DropdownMenuItem onClick={() => handleComplete(trip.id)}>
                              Mark as Completed
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(trip.id)}>
                            Delete Trip
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
