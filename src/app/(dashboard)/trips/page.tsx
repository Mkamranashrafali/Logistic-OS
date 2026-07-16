"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Filter, MoreHorizontal, FileText, Loader2, MapPin } from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trips</h1>
          <p className="text-muted-foreground">Monitor ongoing trips and view past trip histories.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search trips by ID or location..." className="pl-9 bg-background" />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Trip ID</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : trips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No trips found.
                </TableCell>
              </TableRow>
            ) : (
              trips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">
                    <span className="truncate w-24 inline-block">{trip.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-xs">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                        <span className="truncate w-32">{trip.origin || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-xs">
                        <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="truncate w-32 text-muted-foreground">{trip.destination || 'N/A'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{trip.start_time ? new Date(trip.start_time).toLocaleString() : 'N/A'}</TableCell>
                  <TableCell className="text-sm">{trip.end_time ? new Date(trip.end_time).toLocaleString() : 'N/A'}</TableCell>
                  <TableCell className="text-sm">{trip.distance_travelled ? `${trip.distance_travelled} km` : '0 km'}</TableCell>
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
  );
}
