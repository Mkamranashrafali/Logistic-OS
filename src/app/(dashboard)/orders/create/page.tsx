"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function CreateOrderPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  
  // Form State
  const [customerId, setCustomerId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [driverId, setDriverId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const custData = await api.get('/customers');
        setCustomers(custData || []);
        
        const availabilityData: any = await api.get('/admin/orders/availability');
        if (availabilityData) {
          setAvailableDrivers(availabilityData.drivers || []);
          setAvailableVehicles(availabilityData.vehicles || []);
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Create the base order
      const orderPayload = {
        customer_id: customerId || null,
        pickup_location: pickupLocation,
        delivery_location: deliveryLocation,
        expected_delivery_date: deliveryDate ? new Date(deliveryDate).toISOString() : null
      };

      const newOrder: any = await api.post('/orders', orderPayload);

      // 2. If assignment requested, trigger the admin workflow API
      if (driverId && vehicleId) {
        await api.post(`/admin/orders/${newOrder.id}/assign`, {
          driver_id: driverId,
          vehicle_id: vehicleId
        });
      } else if (driverId || vehicleId) {
        throw new Error("Both Driver and Vehicle must be selected to assign resources immediately.");
      }

      // Success
      router.push('/orders');
    } catch (err: any) {
      setError(err.message || "Failed to create order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in-50">
      <div className="flex items-center gap-4">
        <Link href="/orders" className={buttonVariants({ variant: "ghost", size: "icon" })}><ArrowLeft className="h-4 w-4" /></Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Order</h1>
          <p className="text-muted-foreground">Enter details to generate a new logistics order.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Basic information about the customer and route.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
                {error}
              </div>
            )}
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer</label>
                <Select value={customerId} onValueChange={(val) => setCustomerId(val || "")}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery Date</label>
                <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pickup Location</label>
                <Input placeholder="Enter pickup address" value={pickupLocation} onChange={e => setPickupLocation(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Destination</label>
                <Input placeholder="Enter destination address" value={deliveryLocation} onChange={e => setDeliveryLocation(e.target.value)} required />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-4">Initial Assignment (Optional)</h3>
              <p className="text-sm text-muted-foreground mb-4">Assign a driver and vehicle immediately, or leave blank to assign later.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign Driver</label>
                  <Select value={driverId} onValueChange={(val) => setDriverId(val || "")}>
                    <SelectTrigger><SelectValue placeholder="Select available driver" /></SelectTrigger>
                    <SelectContent>
                      {availableDrivers.length === 0 && <SelectItem value="none" disabled>No drivers available</SelectItem>}
                      {availableDrivers.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign Vehicle</label>
                  <Select value={vehicleId} onValueChange={(val) => setVehicleId(val || "")}>
                    <SelectTrigger><SelectValue placeholder="Select available vehicle" /></SelectTrigger>
                    <SelectContent>
                      {availableVehicles.length === 0 && <SelectItem value="none" disabled>No vehicles available</SelectItem>}
                      {availableVehicles.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.plate} ({v.make})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2 bg-muted/20 border-t px-6 py-4">
            <Link href="/orders" className={buttonVariants({ variant: "outline" })}>Cancel</Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Order
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
