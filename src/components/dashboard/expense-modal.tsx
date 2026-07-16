"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ExpenseModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  expense 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
  expense: any | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [trips, setTrips] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    trip_id: "",
    amount: "",
    category: "fuel",
    description: "",
  });

  useEffect(() => {
    if (isOpen) {
      api.get('/trips').then(data => setTrips(data || [])).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (expense) {
      setFormData({
        trip_id: expense.trip_id || "",
        amount: expense.amount ? String(expense.amount) : "",
        category: expense.category || "fuel",
        description: expense.description || "",
      });
    } else {
      setFormData({
        trip_id: "",
        amount: "",
        category: "fuel",
        description: "",
      });
    }
    setError("");
  }, [expense, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      
      if (expense) {
        await api.patch(`/expenses/${expense.id}`, payload);
      } else {
        await api.post('/expenses', payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save expense");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Add Expense"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}
          <div className="space-y-2">
            <label className="text-sm font-medium">Trip</label>
            <Select 
              value={formData.trip_id} 
              onValueChange={v => setFormData({...formData, trip_id: v})}
              disabled={!!expense} // Normally you don't change trip after creating expense
            >
              <SelectTrigger><SelectValue placeholder="Select a trip" /></SelectTrigger>
              <SelectContent>
                {trips.length === 0 && <SelectItem value="none" disabled>No active trips</SelectItem>}
                {trips.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.id.substring(0, 8)} ({t.origin} to {t.destination})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select 
              value={formData.category} 
              onValueChange={v => setFormData({...formData, category: v})}
            >
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fuel">Fuel</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="tolls">Tolls</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount ($)</label>
            <Input 
              type="number"
              step="0.01"
              required 
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              placeholder="150.00"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Gas station stop on route 66"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading || !formData.trip_id}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
