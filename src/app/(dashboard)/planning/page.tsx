"use client";

import { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Loader2, Route, Clock, Navigation } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AssignmentModal } from "@/components/planning/assignment-modal";

import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function PlanningQueuePage() {
  const queryClient = useQueryClient();

  const { data: ordersData, isPending } = useQuery({
    queryKey: ["planning"],
    queryFn: async () => {
      const res = await api.get("/planning/orders");
      return res || [];
    },
  });

  const orders = ordersData || [];

  const [assignOrderId, setAssignOrderId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAssignClick = (orderId: string) => {
    setAssignOrderId(orderId);
    setIsModalOpen(true);
  };

  const handleAssigned = () => {
    queryClient.invalidateQueries({ queryKey: ["planning"] });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: ["trips"] });
    queryClient.invalidateQueries({ queryKey: ["drivers"] });
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planning Queue</h1>
          <p className="text-muted-foreground">Manage unassigned orders and schedule future dispatch dates.</p>
        </div>
        <Link href="/orders/create" className={buttonVariants({ variant: "default" })}>
          Create Order
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders Waiting Assignment</CardTitle>
          <CardDescription>Select an order to find an available driver and vehicle pair.</CardDescription>
        </CardHeader>
        <CardContent>
          {(isPending && !ordersData) ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10">
              <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Orders in Queue</h3>
              <p className="text-muted-foreground">All orders have been assigned or none have been created.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-sm">
                            <Navigation className="w-3 h-3 mr-2 text-muted-foreground" />
                            {order.pickup_location}
                          </div>
                          <div className="flex items-center text-sm">
                            <Route className="w-3 h-3 mr-2 text-muted-foreground" />
                            {order.delivery_location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.expected_delivery_date ? (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                            {new Date(order.expected_delivery_date).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                          {order.order_status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="secondary" size="sm" onClick={() => handleAssignClick(order.id)}>
                          Assign Resource
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AssignmentModal
        orderId={assignOrderId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAssigned={handleAssigned}
      />
    </div>
  );
}
