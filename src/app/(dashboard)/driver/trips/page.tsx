"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Loader2, MapPin, ChevronDown, ChevronUp, Clock, Truck, Calendar, Activity } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery } from "@tanstack/react-query";

export default function DriverTripsPage() {
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

  const { data, isPending } = useQuery({
    queryKey: ["driver-trips-with-activities"],
    queryFn: async () => {
      const [tripsData, activitiesData, profileData] = await Promise.all([
        api.get('/driver/trips'),
        api.get('/driver/activities'),
        api.get('/driver/profile').catch(() => null)
      ]);

      return {
        trips: tripsData || [],
        activities: activitiesData || [],
        profile: profileData || null
      };
    },
  });

  const trips = data?.trips || [];
  const activities = data?.activities || [];
  const profile = data?.profile || null;

  const toggleExpand = (tripId: string) => {
    setExpandedTripId(prev => (prev === tripId ? null : tripId));
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trip History</h1>
        <p className="text-muted-foreground">Detailed history of all assigned trips and individual activity logs.</p>
      </div>

      <div className="space-y-4">
        {trips.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No trip history"
            description="You currently have no assigned or historical trips."
          />
        ) : (
          trips.map((trip: any) => {
            const isExpanded = expandedTripId === trip.id;
            
            // Filter timeline activities strictly for THIS trip
            const tripActivities = activities.filter((act: any) => act.trip_id === trip.id);

            return (
              <Card key={trip.id} className="overflow-hidden border transition-all duration-200 hover:shadow-md">
                <CardHeader 
                  className="cursor-pointer bg-card hover:bg-muted/20 transition-colors p-5 select-none"
                  onClick={() => toggleExpand(trip.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-lg font-bold">
                          TRP-{trip.id.substring(0, 8).toUpperCase()}
                        </CardTitle>
                        <StatusBadge status={trip.trip_status} />
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-foreground pt-1">
                        <span className="font-semibold">{trip.origin || 'N/A'}</span>
                        <span className="text-muted-foreground">→</span>
                        <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        <span className="font-semibold">{trip.destination || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-4">
                      <div className="text-left sm:text-right text-xs text-muted-foreground">
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(trip.created_at || trip.start_time).toLocaleDateString()}
                        </p>
                        {profile?.assigned_vehicle?.name && (
                          <p className="font-medium text-foreground mt-0.5">
                            {profile.assigned_vehicle.name}
                          </p>
                        )}
                      </div>

                      <div className="p-2 rounded-full bg-muted/50 hover:bg-muted shrink-0 text-muted-foreground">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* EXPANDED TRIP TIMELINE */}
                {isExpanded && (
                  <CardContent className="border-t bg-muted/10 p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                    <div>
                      <h4 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" /> Trip Timeline & Activity Log
                      </h4>

                      {/* Explicitly show timeline events for THIS trip */}
                      <div className="space-y-4 relative pl-4 border-l-2 border-primary/20 ml-2">
                        {/* Trip Created / Scheduled Event */}
                        <div className="relative group">
                          <div className="absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full bg-blue-500 ring-4 ring-card" />
                          <div>
                            <p className="text-sm font-semibold text-foreground">Trip Scheduled</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(trip.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Trip Started Timestamp */}
                        {trip.start_time && (
                          <div className="relative group">
                            <div className="absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full bg-amber-500 ring-4 ring-card" />
                            <div>
                              <p className="text-sm font-semibold text-foreground">Trip Started</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(trip.start_time).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Recorded Activity Log Events */}
                        {tripActivities.length > 0 ? (
                          tripActivities.map((act: any) => (
                            <div key={act.id} className="relative group">
                              <div className="absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full bg-primary ring-4 ring-card" />
                              <div>
                                <p className="text-sm font-semibold capitalize text-foreground">
                                  {act.action_type.replace(/_/g, ' ').toLowerCase()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(act.timestamp).toLocaleString()}
                                </p>
                                {act.notes && (
                                  <p className="text-xs mt-1 text-muted-foreground bg-card p-2 rounded border max-w-lg">
                                    {act.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : null}

                        {/* Trip Completed Event */}
                        {trip.end_time || trip.trip_status === 'completed' ? (
                          <div className="relative group">
                            <div className="absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-card" />
                            <div>
                              <p className="text-sm font-semibold text-foreground">Trip Completed</p>
                              <p className="text-xs text-muted-foreground">
                                {trip.end_time ? new Date(trip.end_time).toLocaleString() : 'Completed'}
                              </p>
                            </div>
                          </div>
                        ) : null}

                        {/* Empty timeline state if no specific activities or timestamps exist */}
                        {tripActivities.length === 0 && !trip.start_time && !trip.end_time && trip.trip_status !== 'completed' && (
                          <div className="text-xs text-muted-foreground py-2 italic">
                            No activity recorded for this trip.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Operational Details Bar */}
                    <div className="pt-4 border-t grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Distance Travelled:</span>
                        <p className="font-semibold text-foreground">{trip.distance_travelled ? `${trip.distance_travelled} km` : '0 km'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Current Location:</span>
                        <p className="font-semibold text-foreground">{trip.current_location || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Delivery Notes:</span>
                        <p className="font-semibold text-foreground">{trip.delivery_notes || 'None'}</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
