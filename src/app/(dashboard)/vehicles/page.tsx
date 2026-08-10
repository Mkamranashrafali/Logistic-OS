"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, MoreHorizontal, Loader2, Truck, Plus, Gauge, Weight } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { VehicleModal } from "@/components/dashboard/vehicle-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function VehiclesPage() {
  const queryClient = useQueryClient();

  const { data: vehiclesData, isPending } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const res = await api.get('/vehicles');
      return res || [];
    },
  });

  const vehicles = vehiclesData || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleAdd = () => {
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await api.delete(`/vehicles/${id}`);
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    } catch (err) {
      console.error("Failed to delete vehicle", err);
      alert("Failed to delete vehicle");
    }
  };

  const filteredVehicles = vehicles.filter((vehicle: any) => {
    const searchStr = `${vehicle.plate_number || ""} ${vehicle.make || ""} ${vehicle.model || ""}`.toLowerCase();
    const matchesSearch = searchTerm === "" || searchStr.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || vehicle.availability_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Vehicles</h1>
          <p className="text-muted-foreground text-sm">Manage your operational logistics fleet and vehicle status.</p>
        </div>
        <Button onClick={handleAdd} className="shadow-sm">
          <Plus className="h-4 w-4 mr-2" /> Add Vehicle
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles by plate, make, or model..."
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
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in_use">In Use</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="out_of_service">Out of Service</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(isPending && !vehiclesData) ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredVehicles.length === 0 ? (
        <EmptyState
          title="No vehicles found"
          description={searchTerm || statusFilter !== "all" ? "No vehicles match your current filters." : "You haven't added any vehicles to your fleet yet."}
          icon={Truck}
          action={searchTerm || statusFilter !== "all" ? undefined : <Button onClick={handleAdd}>Add Vehicle</Button>}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map((vehicle: any) => (
            <Card key={vehicle.id} className="group overflow-hidden border border-border/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-card">
              <CardHeader className="p-5 bg-muted/20 border-b flex flex-row items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 group-hover:scale-105 transition-transform">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground truncate max-w-[160px]">
                      {vehicle.make || 'Vehicle'} {vehicle.model || ''}
                    </h3>
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-background border font-mono text-xs font-semibold rounded text-foreground">
                      {vehicle.plate_number || 'NO PLATE'}
                    </span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg hover:bg-muted h-8 w-8 p-0 text-muted-foreground hover:text-foreground transition-colors">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleEdit(vehicle)}>
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => handleDelete(vehicle.id)}>
                      Delete Vehicle
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</span>
                  <StatusBadge status={vehicle.availability_status} />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/40 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground flex items-center gap-1 mb-0.5">
                      <Weight className="h-3 w-3 text-primary" /> Capacity
                    </p>
                    <p className="font-semibold text-foreground">
                      {vehicle.capacity ? `${vehicle.capacity} kg` : 'N/A'}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground flex items-center gap-1 mb-0.5">
                      <Gauge className="h-3 w-3 text-primary" /> Mileage / Condition
                    </p>
                    <p className="font-semibold text-foreground">Operational</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["vehicles"] })}
        vehicle={selectedVehicle}
      />
    </div>
  );
}
