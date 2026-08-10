"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api, uploadFile, getImageUrl } from "@/lib/api";
import { Loader2, Phone, Mail, FileCheck, Truck, Building2, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

import { useAuth } from "@/context/AuthContext";

import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function DriverProfilePage() {
  const { user, updateAuthUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isPending } = useQuery({
    queryKey: ["driver-profile"],
    queryFn: async () => {
      return await api.get('/driver/profile');
    },
  });

  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMsg(null);

    try {
      // 1. Upload file using central endpoint
      const uploadRes = await uploadFile(file);
      const newPicUrl = uploadRes.url;

      // 2. Persist updated profile picture URL to Database
      await api.put('/driver/profile', {
        profile_pic_url: newPicUrl,
      });

      // 3. Invalidate query cache & update global auth state
      queryClient.invalidateQueries({ queryKey: ["driver-profile"] });
      if (user) {
        updateAuthUser({ ...user, profile_pic_url: newPicUrl });
      }
      setStatusMsg({ type: 'success', text: 'Profile picture updated successfully!' });
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update profile picture' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [profile?.profile_pic_url]);

  if (isPending && !profile) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!profile) {
    return <p className="text-muted-foreground">Profile could not be loaded.</p>;
  }

  const avatarSrc = avatarError 
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name || 'Driver')}`
    : (getImageUrl(profile.profile_pic_url) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name || 'Driver')}`);

  return (
    <div className="space-y-6 animate-in fade-in-50 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Driver Profile</h1>
      
      {statusMsg && (
        <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
          statusMsg.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <div 
                className="relative group cursor-pointer"
                onClick={() => !isUploading && fileInputRef.current?.click()}
                title="Click to update profile picture"
              >
                <Avatar className="h-20 w-20 border shadow-sm overflow-hidden flex items-center justify-center bg-primary/5">
                  {avatarSrc ? (
                    <img 
                      src={avatarSrc} 
                      key={avatarSrc} 
                      alt={profile.name} 
                      className="h-full w-full object-cover" 
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {profile.name?.substring(0, 2).toUpperCase() || 'DR'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Upload className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl">{profile.name}</CardTitle>
                <CardDescription>Professional Driver</CardDescription>
              </div>
            </div>
            <StatusBadge status={profile.availability_status} />
          </div>
          <div className="pt-3">
             <Button 
               variant="outline" 
               size="sm"
               disabled={isUploading}
               onClick={() => fileInputRef.current?.click()}
               className="gap-2"
             >
               {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
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
