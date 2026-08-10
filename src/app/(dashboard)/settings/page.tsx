"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { api, uploadFile, getImageUrl } from "@/lib/api";
import { Loader2, Upload } from "lucide-react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function SettingsPage() {
  const { user, updateAuthUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const logoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    contact_email: "",
    phone: "",
    address: "",
    logo_url: "",
  });

  const { data: companyData, isPending } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const data = await api.get('/companies/me');
      return data || null;
    },
    enabled: !!user && user.role !== 'driver',
  });

  useEffect(() => {
    if (user?.role === 'driver') {
      router.push('/driver/profile');
      return;
    }

    if (companyData) {
      setFormData({
        name: companyData.name || "",
        contact_email: companyData.contact_email || "",
        phone: companyData.phone || "",
        address: companyData.address || "",
        logo_url: companyData.logo_url || "",
      });
    }
  }, [user, router, companyData]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setError("");
    setSuccess("");

    try {
      // 1. Upload logo file using central upload endpoint
      const uploadRes = await uploadFile(file);
      const newLogoUrl = uploadRes.url;

      // 2. Update form state & persist to database immediately
      const updatedFormData = { ...formData, logo_url: newLogoUrl };
      setFormData(updatedFormData);

      await api.put('/companies/me', updatedFormData);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      if (user) {
        updateAuthUser({ ...user, profile_pic_url: newLogoUrl });
      }
      setSuccess("Company logo updated and saved successfully!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload company logo");
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      const data = await api.put('/companies/me', formData);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setSuccess("Settings saved successfully!");
      if (data) {
        setFormData({
          name: data.name || "",
          contact_email: data.contact_email || "",
          phone: data.phone || "",
          address: data.address || "",
          logo_url: data.logo_url || "",
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || err.response?.data?.detail || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [formData.logo_url]);

  if (isPending && !companyData) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const logoSrc = logoError ? undefined : getImageUrl(formData.logo_url);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in-50">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your company profile and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Update your company details and logo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</div>}
          {success && <div className="text-sm text-green-600 bg-green-500/10 border border-green-500/20 p-3 rounded">{success}</div>}

          <input
            type="file"
            ref={logoInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />

          <div className="flex items-center gap-6">
            <div 
              className="relative group cursor-pointer"
              onClick={() => !isUploadingLogo && logoInputRef.current?.click()}
              title="Click to upload new logo"
            >
              <Avatar className="h-20 w-20 border shadow-sm overflow-hidden flex items-center justify-center bg-primary/5">
                {logoSrc ? (
                  <img 
                    src={logoSrc} 
                    key={logoSrc} 
                    alt={formData.name} 
                    className="h-full w-full object-cover" 
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {formData.name.substring(0, 2).toUpperCase() || 'LC'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploadingLogo ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Upload className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              disabled={isUploadingLogo}
              onClick={() => logoInputRef.current?.click()}
              className="gap-2"
            >
              {isUploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload New Logo
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Email</label>
              <Input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^\d\s\+\-\(\)]/g, '') })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Headquarters Address</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t bg-muted/20 px-6 py-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
