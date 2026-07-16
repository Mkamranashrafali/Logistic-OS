"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Loader2, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

export default function DriverTripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await api.get('/driver/trips');
        setTrips(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrips();
  }, []);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
      <div className="grid gap-4">
        {trips.length === 0 ? (
          <p className="text-muted-foreground">No trips found.</p>
        ) : (
          trips.map(trip => (
            <Card key={trip.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Trip ID: {trip.id.split('-')[0]}</CardTitle>
                  <StatusBadge status={trip.trip_status} />
                </div>
                <CardDescription>{new Date(trip.created_at).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 text-sm mt-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{trip.origin || 'N/A'}</span>
                  <span>→</span>
                  <MapPin className="h-3 w-3 text-red-500" />
                  <span>{trip.destination || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
