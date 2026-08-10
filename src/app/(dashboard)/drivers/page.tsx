"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Phone, Mail, Star, MoreVertical, Loader2, Users, Plus, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";
import { DriverModal } from "@/components/dashboard/driver-modal";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function DriversPage() {
  const queryClient = useQueryClient();

  const { data: driversData, isPending } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const res = await api.get('/drivers');
      return res || [];
    },
  });

  const drivers = driversData || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleAdd = () => {
    setSelectedDriver(null);
    setIsModalOpen(true);
  };

  const handleEdit = (driver: any) => {
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;
    try {
      await api.delete(`/drivers/${id}`);
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    } catch (err) {
      console.error("Failed to delete driver", err);
      alert("Failed to delete driver");
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this driver? They will not be able to log in.")) return;
    try {
      await api.post(`/drivers/${id}/deactivate`, {});
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    } catch (err) {
      console.error("Failed to deactivate driver", err);
      alert("Failed to deactivate driver");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await api.post(`/drivers/${id}/activate`, {});
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    } catch (err) {
      console.error("Failed to activate driver", err);
      alert("Failed to activate driver");
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Are you sure you want to archive this driver? This will revoke access but preserve history.")) return;
    try {
      await api.post(`/drivers/${id}/archive`, {});
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    } catch (err) {
      console.error("Failed to archive driver", err);
      alert("Failed to archive driver");
    }
  };

  const handleResendInvitation = async (id: string) => {
    try {
      await api.post(`/drivers/${id}/resend-invitation`, {});
      alert("Invitation resent successfully!");
    } catch (err: any) {
      console.error("Failed to resend invitation", err);
      alert(err.response?.data?.detail || "Failed to resend invitation");
    }
  };

  const filteredDrivers = drivers.filter((driver: any) => {
    const searchStr = `${driver.name || ""} ${driver.license_number || ""} ${driver.phone || ""} ${driver.email || ""}`.toLowerCase();
    const matchesSearch = searchTerm === "" || searchStr.includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === "all") return true;
    if (statusFilter === "active" || statusFilter === "inactive" || statusFilter === "pending") {
      return driver.lifecycle_status === statusFilter;
    }
    return driver.availability_status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
          <p className="text-muted-foreground text-sm">Manage driver accounts, performance, and operational availability.</p>
        </div>
        <Button onClick={handleAdd} className="shadow-sm">
          <Plus className="h-4 w-4 mr-2" /> Add Driver
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search drivers by name, phone, license..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="on_trip">On Trip</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(isPending && !driversData) ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredDrivers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No drivers found"
          description={searchTerm || statusFilter !== "all" ? "Try adjusting your search terms or filters." : "Get started by adding your first driver."}
          action={searchTerm || statusFilter !== "all" ? undefined : <Button onClick={handleAdd}>Add Driver</Button>}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDrivers.map((driver: any) => (
            <Card key={driver.id} className="group overflow-hidden border border-border/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-card">
              <CardHeader className="p-0">
                <div className="h-20 bg-gradient-to-r from-primary/10 via-primary/5 to-muted w-full relative">
                  <div className="absolute -bottom-6 left-6">
                    <Avatar className="h-16 w-16 border-4 border-card bg-background shadow-md">
                      <AvatarImage src={driver.user?.profile_pic_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`} />
                      <AvatarFallback className="font-bold bg-primary/10 text-primary">
                        {driver.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg hover:bg-background/80 h-8 w-8 p-0 bg-background/60 shadow-xs backdrop-blur-xs transition-colors">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(driver)}>Edit Details</DropdownMenuItem>

                        {driver.lifecycle_status === 'pending' && (
                          <DropdownMenuItem onClick={() => handleResendInvitation(driver.id)}>Resend Invitation</DropdownMenuItem>
                        )}
                        {driver.lifecycle_status === 'active' && (
                          <DropdownMenuItem onClick={() => handleDeactivate(driver.id)}>Deactivate</DropdownMenuItem>
                        )}
                        {driver.lifecycle_status === 'inactive' && (
                          <DropdownMenuItem onClick={() => handleActivate(driver.id)}>Activate</DropdownMenuItem>
                        )}

                        <DropdownMenuItem className="text-amber-600 focus:bg-amber-50" onClick={() => handleArchive(driver.id)}>Archive Driver</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => handleDelete(driver.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-9 pb-5 px-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-foreground truncate max-w-[160px]" title={driver.name}>
                      {driver.name}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="h-3 w-3 text-primary" /> Lic: {driver.license_number || 'N/A'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={driver.lifecycle_status} />
                    {driver.lifecycle_status === 'active' && <StatusBadge status={driver.availability_status} />}
                  </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-border/40 text-xs">
                  <div className="flex items-center text-muted-foreground truncate" title={driver.phone}>
                    <Phone className="h-3.5 w-3.5 mr-2 text-primary shrink-0" />
                    {driver.phone || 'N/A'}
                  </div>
                  <div className="flex items-center text-muted-foreground truncate" title={driver.email}>
                    <Mail className="h-3.5 w-3.5 mr-2 text-primary shrink-0" />
                    {driver.email || 'N/A'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/40 text-xs">
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground mb-0.5">Rating</p>
                    <div className="flex items-center font-bold text-foreground">
                      5.0 <Star className="h-3 w-3 ml-1 fill-amber-400 text-amber-400" />
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground mb-0.5">Trips Completed</p>
                    <p className="font-bold text-foreground">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DriverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["drivers"] })}
        driver={selectedDriver}
      />
    </div>
  );
}
