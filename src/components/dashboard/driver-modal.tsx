"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";

interface DriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  driver?: any;
}

export function DriverModal({ isOpen, onClose, onSuccess, driver }: DriverModalProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    license_number: "",
    phone: "",
    availability_status: "available",
  });

  const [archivedDriverData, setArchivedDriverData] = useState<any>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name || "",
        email: driver.email || "",
        license_number: driver.license_number || "",
        phone: driver.phone || "",
        availability_status: driver.availability_status || "available",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        license_number: "",
        phone: "",
        availability_status: "available",
      });
    }
    setError("");
    setArchivedDriverData(null);
  }, [driver, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      if (driver) {
        await api.put(`/drivers/${driver.id}`, formData);
      } else {
        await api.post('/drivers', formData);
      }
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.response?.status === 409 && err.response?.data?.is_archived) {
        setArchivedDriverData(err.response.data);
      } else {
        setError(err.response?.data?.detail || err.message || "Failed to save driver");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!archivedDriverData?.driver_id) return;
    setIsRestoring(true);
    setError("");
    try {
      await api.post(`/drivers/${archivedDriverData.driver_id}/restore`, {});
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to restore driver");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{driver ? "Edit Driver" : "Add Driver"}</DialogTitle>
        </DialogHeader>
        
        {archivedDriverData ? (
          <div className="space-y-4 py-4">
            {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}
            <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-md">
              <h4 className="font-medium text-lg mb-2">Archived Driver Found</h4>
              <p className="text-sm">
                This email address belongs to a driver in your archived records. 
                Would you like to restore their previous profile instead? 
                This will reactivate their account and preserve all historical trips and expenses.
              </p>
            </div>
            <DialogFooter className="flex sm:justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setArchivedDriverData(null)} disabled={isRestoring}>
                Use Different Email
              </Button>
              <Button type="button" onClick={handleRestore} disabled={isRestoring}>
                {isRestoring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Restore Existing Profile
              </Button>
            </DialogFooter>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
            <Input 
              required 
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="driver@example.com"
              disabled={!!driver}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">License Number</label>
            <Input 
              value={formData.license_number}
              onChange={e => setFormData({...formData, license_number: e.target.value.replace(/[^A-Za-z0-9\-]/g, '').toUpperCase()})}
              placeholder="DL-1234567"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value.replace(/[^\d\s\+\-\(\)]/g, '')})}
              placeholder="+1 555-0123"
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
                <SelectItem value="on_leave">On Leave / Disabled</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
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
        )}
      </DialogContent>
    </Dialog>
  );
}
