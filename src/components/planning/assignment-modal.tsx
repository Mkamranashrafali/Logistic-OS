"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar } from "lucide-react";
import { api } from "@/lib/api";

interface AssignmentModalProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void;
}

export function AssignmentModal({ orderId, open, onOpenChange, onAssigned }: AssignmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");

  useEffect(() => {
    if (open && orderId) {
      fetchAvailability();
    }
  }, [open, orderId]);

  const fetchAvailability = async () => {
    setIsLoading(true);
    try {
      const availData = await api.get(`/planning/availability/${orderId}`);
      const recData = await api.get(`/planning/recommendations/${orderId}`);
      
      setDrivers(availData.drivers || []);
      setVehicles(availData.vehicles || []);

      if (recData.recommended_driver) {
        setSelectedDriver(recData.recommended_driver.id);
      }
      if (recData.recommended_vehicle) {
        setSelectedVehicle(recData.recommended_vehicle.id);
      }
    } catch (error) {
      console.error("Failed to load availability", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDriver || !selectedVehicle) return;
    setIsAssigning(true);
    try {
      await api.post(`/planning/assign/${orderId}`, {
        driver_id: selectedDriver,
        vehicle_id: selectedVehicle
      });
      alert("Order Assigned: Trip has been automatically created.");
      onOpenChange(false);
      onAssigned();
    } catch (error: any) {
      alert(`Assignment Failed: ${error.message}`);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Resources</DialogTitle>
          <DialogDescription>
            Select a driver and vehicle for this order. The engine has pre-selected recommendations based on earliest availability.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Driver</label>
              <Select value={selectedDriver} onValueChange={val => setSelectedDriver(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select driver">
                    {selectedDriver ? drivers.find((d: any) => d.id === selectedDriver)?.name : "Select driver"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((d: any) => (
                    <SelectItem key={d.id} value={d.id} disabled={d.status !== 'available' && !d.next_available_date}>
                      <div className="flex justify-between items-center w-full min-w-[250px]">
                        <span>{d.name}</span>
                        {d.status === 'available' ? (
                          <span className="text-xs text-success ml-2">Available</span>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center ml-2">
                            <Calendar className="w-3 h-3 mr-1"/>
                            {d.next_available_date ? new Date(d.next_available_date).toLocaleDateString() : 'Busy'}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vehicle</label>
              <Select value={selectedVehicle} onValueChange={val => setSelectedVehicle(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle">
                    {selectedVehicle ? vehicles.find((v: any) => v.id === selectedVehicle)?.plate_number : "Select vehicle"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v: any) => (
                    <SelectItem key={v.id} value={v.id} disabled={v.status !== 'available' && !v.next_available_date}>
                      <div className="flex justify-between items-center w-full min-w-[250px]">
                        <span>{v.plate_number} ({v.make})</span>
                        {v.status === 'available' ? (
                          <span className="text-xs text-success ml-2">Available</span>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center ml-2">
                            <Calendar className="w-3 h-3 mr-1"/>
                            {v.next_available_date ? new Date(v.next_available_date).toLocaleDateString() : 'Busy'}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAssign} disabled={isLoading || isAssigning || !selectedDriver || !selectedVehicle}>
            {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
