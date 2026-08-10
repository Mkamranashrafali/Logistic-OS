"use client";

import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Filter, MoreHorizontal, Plus, Loader2, Package } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";

import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function OrdersPage() {
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const [ordersData, customersData] = await Promise.all([
        api.get('/orders'),
        api.get('/customers')
      ]);

      const cMap: Record<string, string> = {};
      (customersData || []).forEach((c: any) => {
        cMap[c.id] = c.name;
      });

      return {
        orders: ordersData || [],
        customerMap: cMap,
      };
    },
  });

  const orders = data?.orders || [];
  const customerMap = data?.customerMap || {};

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await api.delete(`/orders/${id}`);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (err) {
      console.error("Failed to delete order", err);
      alert("Failed to delete order");
    }
  };

  const filteredOrders = orders.filter((order: any) => {
    const customerName = customerMap[order.customer_id] || "Unknown Customer";
    const searchStr = `${customerName} ${order.pickup_location || ""} ${order.delivery_location || ""}`.toLowerCase();

    const matchesSearch = searchTerm === "" || searchStr.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.order_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage logistics orders and assignments.</p>
        </div>
        <Link href="/orders/create" className={buttonVariants({ variant: "default" })}>
          <Plus className="mr-2 h-4 w-4" /> Create Order
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer or location..."
            className="pl-9 bg-background w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Customer</TableHead>
              <TableHead>Pickup</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(isPending && !data) ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <EmptyState
                    title="No orders found"
                    description={searchTerm || statusFilter !== "all" ? "No orders match your current filters." : "You haven't created any orders yet."}
                    icon={Package}
                    className="border-0 rounded-none bg-transparent"
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order: any) => {
                const customerName = customerMap[order.customer_id] || "Unknown Customer";
                return (
                  <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="font-medium">{customerName}</div>
                      <div className="text-xs text-muted-foreground truncate w-24">#{order.id.slice(0, 8)}</div>
                    </TableCell>
                    <TableCell className="text-sm max-w-[150px] truncate" title={order.pickup_location}>
                      {order.pickup_location || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm max-w-[150px] truncate" title={order.delivery_location}>
                      {order.delivery_location || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.order_status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(order.id)}>
                            Delete Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
