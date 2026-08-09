"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    contact_email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (user?.role === 'driver') {
      router.push('/driver/profile');
      return;
    }

    const fetchCompany = async () => {
      try {
        const data = await api.get('/companies/me');
        if (data) {
          setFormData({
            name: data.name || "",
            contact_email: data.contact_email || "",
            phone: data.phone || "",
            address: data.address || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch company details", err);
        setError("Failed to load company details");
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      fetchCompany();
    }
  }, [user, router]);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      const data = await api.put('/companies/me', formData);
      setSuccess("Settings saved successfully!");
      if (data) {
        setFormData({
          name: data.name || "",
          contact_email: data.contact_email || "",
          phone: data.phone || "",
          address: data.address || "",
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

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
          {success && <div className="text-sm text-green-600 bg-green-50 p-3 rounded">{success}</div>}

          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {formData.name.substring(0, 2).toUpperCase() || 'LC'}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline">Upload New Logo</Button>
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


