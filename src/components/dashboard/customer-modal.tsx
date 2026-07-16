"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export function CustomerModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  customer 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
  customer: any | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        company_name: customer.company_name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
      });
    } else {
      setFormData({
        name: "",
        company_name: "",
        email: "",
        phone: "",
        address: "",
      });
    }
    setError("");
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (customer) {
        await api.patch(`/customers/${customer.id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save customer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Customer" : "Add Customer"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}
          <div className="space-y-2">
            <label className="text-sm font-medium">Contact Name</label>
            <Input 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Jane Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name</label>
            <Input 
              value={formData.company_name}
              onChange={e => setFormData({...formData, company_name: e.target.value})}
              placeholder="Acme Corp"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input 
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="jane@acme.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              placeholder="+1 555-0199"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Input 
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              placeholder="123 Main St"
            />
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
