"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Filter, MoreHorizontal, FileText, Wrench, Loader2, Truck } from "lucide-react";
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

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/vehicles');
      setVehicles(data || []);
    } catch (err) {
      console.error("Failed to fetch vehicles", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to disable/delete this vehicle?")) return;
    try {
      await api.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch (err) {
      console.error("Failed to delete vehicle", err);
      alert("Failed to delete vehicle");
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchStr = `${vehicle.plate_number || ""} ${vehicle.make || ""} ${vehicle.model || ""}`.toLowerCase();
    const matchesSearch = searchTerm === "" || searchStr.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || vehicle.availability_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-muted-foreground">Manage your logistics fleet and maintenance schedules.</p>
        </div>
        <Button onClick={handleAdd}>Add Vehicle</Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles by plate or model..."
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

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>License Plate</TableHead>
              <TableHead>Make & Model</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <EmptyState
                    title="No vehicles found"
                    description={searchTerm || statusFilter !== "all" ? "No vehicles match your current filters." : "You haven't added any vehicles yet."}
                    icon={Truck}
                    className="border-0 rounded-none bg-transparent"
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="px-2 py-1 bg-secondary rounded-md text-sm font-mono inline-block border">
                      {vehicle.plate_number || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{vehicle.make || 'Unknown'} {vehicle.model}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{vehicle.capacity ? `${vehicle.capacity} kg` : 'N/A'}</TableCell>
                  <TableCell>
                    <StatusBadge status={vehicle.availability_status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(vehicle)}>
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(vehicle.id)}>
                          Delete Vehicle
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

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchVehicles}
        vehicle={selectedVehicle}
      />
    </div>
  );
}
