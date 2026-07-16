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
  
  // Form State
  const [customerId, setCustomerId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const custData = await api.get('/customers');
        setCustomers(custData || []);
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
      const orderPayload = {
        customer_id: customerId || null,
        pickup_location: pickupLocation,
        delivery_location: deliveryLocation,
        expected_delivery_date: deliveryDate ? new Date(deliveryDate).toISOString() : null
      };

      await api.post('/orders', orderPayload);

      // Navigate to planning queue
      router.push('/planning');
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
          <p className="text-muted-foreground">Enter details to generate a new logistics order. It will enter the Planning Queue.</p>
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
          </CardContent>
          <CardFooter className="justify-end gap-2 bg-muted/20 border-t px-6 py-4">
            <Link href="/orders" className={buttonVariants({ variant: "outline" })}>Cancel</Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create & Queue for Planning
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
