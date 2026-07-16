"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Loader2, MapPin, UserX, Clock } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function HistoryPage() {
  const [completedTrips, setCompletedTrips] = useState<any[]>([]);
  const [terminatedDrivers, setTerminatedDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch trips
        const tripsData = await api.get('/trips');
        const pastTrips = (tripsData || []).filter((t: any) => t.trip_status === 'completed' || t.trip_status === 'COMPLETED');
        setCompletedTrips(pastTrips);

        // Fetch drivers including deleted
        const driversData = await api.get('/drivers?include_deleted=true');
        const deletedDrivers = (driversData || []).filter((d: any) => d.is_deleted === true);
        setTerminatedDrivers(deletedDrivers);

      } catch (err) {
        console.error("Failed to fetch history data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">History & Archives</h1>
        <p className="text-muted-foreground">Review completed trips and past fleet records.</p>
      </div>

      <Tabs defaultValue="trips" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="trips">Completed Trips</TabsTrigger>
          <TabsTrigger value="drivers">Terminated Drivers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trips" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedTrips.length === 0 ? (
              <p className="text-muted-foreground p-4">No completed trips found.</p>
            ) : (
              completedTrips.map(trip => (
                <Card key={trip.id} className="opacity-90">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Trip ID: {trip.id.split('-')[0]}</CardTitle>
                      <StatusBadge status="completed" />
                    </div>
                    <CardDescription className="flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(trip.updated_at || trip.created_at).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 text-sm mt-2 font-medium">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>{trip.origin || 'N/A'}</span>
                      <span className="text-muted-foreground">→</span>
                      <MapPin className="h-3 w-3 text-red-500" />
                      <span>{trip.destination || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="drivers" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {terminatedDrivers.length === 0 ? (
              <p className="text-muted-foreground p-4">No terminated drivers found.</p>
            ) : (
              terminatedDrivers.map(driver => (
                <Card key={driver.id} className="bg-muted/30 border-dashed">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 grayscale opacity-70">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`} />
                        <AvatarFallback><UserX className="h-6 w-6" /></AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-lg text-muted-foreground line-through decoration-muted-foreground/30">{driver.name}</h3>
                        <p className="text-xs text-destructive flex items-center font-medium mt-1">
                          <UserX className="h-3 w-3 mr-1" /> Terminated
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t text-sm text-muted-foreground space-y-1">
                      <p>License: {driver.license_number || 'N/A'}</p>
                      <p>Joined: {new Date(driver.created_at).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
