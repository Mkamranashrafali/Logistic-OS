"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicle?: any;
}

export function VehicleModal({ isOpen, onClose, onSuccess, vehicle }: VehicleModalProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    plate_number: "",
    capacity: "",
    availability_status: "available",
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        make: vehicle.make || "",
        model: vehicle.model || "",
        plate_number: vehicle.plate_number || "",
        capacity: vehicle.capacity ? String(vehicle.capacity) : "",
        availability_status: vehicle.availability_status || "available",
      });
    } else {
      setFormData({
        make: "",
        model: "",
        plate_number: "",
        capacity: "",
        availability_status: "available",
      });
    }
    setError("");
  }, [vehicle, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };

      if (vehicle) {
        await api.put(`/vehicles/${vehicle.id}`, payload);
      } else {
        await api.post('/vehicles', payload);
      }
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{vehicle ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}
          <div className="space-y-2">
            <label className="text-sm font-medium">Make</label>
            <Input 
              required 
              value={formData.make}
              onChange={e => setFormData({...formData, make: e.target.value})}
              placeholder="Ford"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Model</label>
            <Input 
              required
              value={formData.model}
              onChange={e => setFormData({...formData, model: e.target.value})}
              placeholder="Transit"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Plate Number</label>
            <Input 
              required
              value={formData.plate_number}
              onChange={e => setFormData({...formData, plate_number: e.target.value})}
              placeholder="ABC-1234"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Capacity (kg)</label>
            <Input 
              type="number"
              value={formData.capacity}
              onChange={e => setFormData({...formData, capacity: e.target.value})}
              placeholder="2000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select 
              value={formData.availability_status} 
              onValueChange={v => setFormData({...formData, availability_status: v || ""})}
            >
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="on_trip">On Trip</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
