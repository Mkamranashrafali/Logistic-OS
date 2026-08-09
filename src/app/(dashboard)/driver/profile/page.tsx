"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { Loader2, User, Phone, Mail, FileCheck, Truck, Building2, Upload } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

export default function DriverProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get('/driver/profile');
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!profile) {
    return <p className="text-muted-foreground">Profile could not be loaded.</p>;
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Driver Profile</h1>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer">
                <Avatar className="h-20 w-20 border">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {profile.name?.substring(0, 2).toUpperCase() || 'DR'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl">{profile.name}</CardTitle>
                <CardDescription>Professional Driver</CardDescription>
              </div>
            </div>
            <StatusBadge status={profile.availability_status} />
          </div>
          <div className="pt-2">
             <Button variant="outline" size="sm">
               Change Profile Picture
             </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{profile.phone || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileCheck className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">License Number</p>
                <p className="text-sm text-muted-foreground">{profile.license_number || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Company</p>
                <p className="text-sm text-muted-foreground">{profile.company?.name || 'Unassigned'}</p>
              </div>
            </div>
          </div>

          {profile.assigned_vehicle && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5" /> Currently Assigned Vehicle
              </h3>
              <div className="bg-muted/50 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{profile.assigned_vehicle.name}</p>
                  <p className="text-sm text-muted-foreground">License: {profile.assigned_vehicle.license_plate}</p>
                </div>
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase">
                  Active
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
