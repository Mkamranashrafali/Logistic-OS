"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, MoreHorizontal, Phone, Mail, Loader2, Building2, MapPin, Plus, User } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { CustomerModal } from "@/components/dashboard/customer-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function CustomersPage() {
  const queryClient = useQueryClient();

  const { data: customersData, isPending } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await api.get('/customers');
      return res || [];
    },
  });

  const customers = customersData || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const handleAdd = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await api.delete(`/customers/${id}`);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    } catch (err) {
      console.error("Failed to delete customer", err);
      alert("Failed to delete customer");
    }
  };

  const filteredCustomers = customers.filter((customer: any) => {
    const searchStr = `${customer.name || ""} ${customer.company_name || ""} ${customer.email || ""}`.toLowerCase();
    return searchTerm === "" || searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Directory</h1>
          <p className="text-muted-foreground text-sm">Manage client relationships, contact profiles, and billing addresses.</p>
        </div>
        <Button onClick={handleAdd} className="shadow-sm">
          <Plus className="h-4 w-4 mr-2" /> Add Customer
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by company or contact name..."
            className="pl-9 bg-background w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {(isPending && !customersData) ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description={searchTerm ? "No customers match your search criteria." : "You haven't added any client profiles yet."}
          icon={Building2}
          action={searchTerm ? undefined : <Button onClick={handleAdd}>Add Customer</Button>}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer: any) => (
            <Card key={customer.id} className="group overflow-hidden border border-border/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-card">
              <CardHeader className="p-5 bg-muted/20 border-b flex flex-row items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 group-hover:scale-105 transition-transform mt-0.5">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground truncate max-w-[160px]" title={customer.name}>
                      {customer.name}
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground truncate max-w-[160px]">
                      {customer.company_name || 'Individual Client'}
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg hover:bg-muted h-8 w-8 p-0 text-muted-foreground hover:text-foreground transition-colors">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleEdit(customer)}>
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => handleDelete(customer.id)}>
                      Delete Profile
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="p-5 space-y-3 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center text-muted-foreground truncate" title={customer.email}>
                    <Mail className="h-3.5 w-3.5 mr-2 text-primary shrink-0" />
                    <span className="truncate">{customer.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground truncate" title={customer.phone}>
                    <Phone className="h-3.5 w-3.5 mr-2 text-primary shrink-0" />
                    <span>{customer.phone || 'N/A'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-start text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mr-2 text-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-2 text-foreground/80 font-medium" title={customer.address}>
                    {customer.address || 'No primary address listed'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["customers"] })}
        customer={selectedCustomer}
      />
    </div>
  );
}
