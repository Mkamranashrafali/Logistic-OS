"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Filter, Phone, Mail, Star, MoreVertical, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";

import { DriverModal } from "@/components/dashboard/driver-modal";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/drivers');
      setDrivers(data || []);
    } catch (err) {
      console.error("Failed to fetch drivers", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedDriver(null);
    setIsModalOpen(true);
  };

  const handleEdit = (driver: any) => {
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to disable/delete this driver?")) return;
    try {
      await api.delete(`/drivers/${id}`);
      fetchDrivers();
    } catch (err) {
      console.error("Failed to delete driver", err);
      alert("Failed to delete driver");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
          <p className="text-muted-foreground">Manage your fleet drivers and view performance.</p>
        </div>
        <Button onClick={handleAdd}>Add Driver</Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search drivers by name or ID..." className="pl-9 bg-background" />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card">
          <p className="text-muted-foreground">No drivers found.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {drivers.map((driver) => (
            <Card key={driver.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="h-20 bg-muted/50 w-full relative">
                  <div className="absolute -bottom-6 left-6">
                    <Avatar className="h-16 w-16 border-4 border-card bg-background">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`} />
                      <AvatarFallback>{driver.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute top-4 right-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 bg-background/50 hover:bg-background/80">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(driver)}>Edit Details</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(driver.id)}>Disable Account</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-10 pb-6 px-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{driver.name}</h3>
                    <p className="text-sm text-muted-foreground truncate w-32">{driver.id}</p>
                  </div>
                  <StatusBadge status={driver.availability_status} />
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    {driver.phone || 'N/A'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Rating</p>
                    <div className="flex items-center font-medium">
                      5.0 <Star className="h-3 w-3 ml-1 fill-warning text-warning" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Trips Completed</p>
                    <p className="font-medium">0</p>
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
        onSuccess={fetchDrivers}
        driver={selectedDriver}
      />
    </div>
  );
}
