"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DocumentModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  document 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
  document: any | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [trips, setTrips] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    trip_id: "",
    title: "",
    file_path: "",
  });

  useEffect(() => {
    if (isOpen) {
      api.get('/trips').then(data => setTrips(data || [])).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (document) {
      setFormData({
        trip_id: document.trip_id || "",
        title: document.title || "",
        file_path: document.file_path || "",
      });
    } else {
      setFormData({
        trip_id: "",
        title: "",
        file_path: "",
      });
    }
    setError("");
  }, [document, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (document) {
        await api.patch(`/documents/${document.id}`, formData);
      } else {
        await api.post('/documents', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save document");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{document ? "Edit Document" : "Add Document"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}
          <div className="space-y-2">
            <label className="text-sm font-medium">Trip</label>
            <Select 
              value={formData.trip_id} 
              onValueChange={v => setFormData({...formData, trip_id: v})}
              disabled={!!document}
            >
              <SelectTrigger><SelectValue placeholder="Select a trip" /></SelectTrigger>
              <SelectContent>
                {trips.length === 0 && <SelectItem value="none" disabled>No active trips</SelectItem>}
                {trips.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.id.substring(0, 8)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Document Title</label>
            <Input 
              required 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Proof of Delivery"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">File URL/Path</label>
            <Input 
              required 
              value={formData.file_path}
              onChange={e => setFormData({...formData, file_path: e.target.value})}
              placeholder="https://storage.example.com/file.pdf"
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
