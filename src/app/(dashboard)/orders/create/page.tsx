import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateOrderPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in-50">
      <div className="flex items-center gap-4">
        <Link href="/orders" className={buttonVariants({ variant: "ghost", size: "icon" })}><ArrowLeft className="h-4 w-4" /></Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Order</h1>
          <p className="text-muted-foreground">Enter details to generate a new logistics order.</p>
        </div>
      </div>

      <form>
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Basic information about the customer and route.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer</label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="c1">Acme Corp</SelectItem>
                    <SelectItem value="c2">Globex Inc</SelectItem>
                    <SelectItem value="c3">Stark Industries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery Date</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pickup Location</label>
                <Input placeholder="Enter pickup address" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Destination</label>
                <Input placeholder="Enter destination address" />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-4">Cargo Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cargo Type</label>
                  <Input placeholder="e.g. Electronics, Machinery" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weight</label>
                  <Input placeholder="e.g. 2,000 lbs" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Input placeholder="Special handling instructions..." />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-4">Assignment</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign Driver (Optional)</label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="d1">Jane Smith (Available)</SelectItem>
                      <SelectItem value="d2">John Doe (Busy)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign Vehicle (Optional)</label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v1">Ford Transit - XYZ-9876 (Available)</SelectItem>
                      <SelectItem value="v2">Volvo VNL - LMN-4567 (Maintenance)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2 bg-muted/20 border-t px-6 py-4">
            <Link href="/orders" className={buttonVariants({ variant: "outline" })}>Cancel</Link>
            <Button>Save Order</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}


