"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Search, Filter, MoreHorizontal, FileText, Phone, Mail, Loader2, Building2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { CustomerModal } from "@/components/dashboard/customer-modal";
import { EmptyState } from "@/components/ui/empty-state";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/customers');
      setCustomers(data || []);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    } finally {
      setIsLoading(false);
    }
  };

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
      fetchCustomers();
    } catch (err) {
      console.error("Failed to delete customer", err);
      alert("Failed to delete customer");
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const searchStr = `${customer.name || ""} ${customer.company_name || ""} ${customer.email || ""}`.toLowerCase();
    return searchTerm === "" || searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your client directory and contact information.</p>
        </div>
        <Button onClick={handleAdd}>Add Customer</Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by company or name..."
            className="pl-9 bg-background w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name / Company</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="p-0">
                  <EmptyState
                    title="No customers found"
                    description={searchTerm ? "No customers match your search." : "You haven't added any customers yet."}
                    icon={Building2}
                    className="border-0 rounded-none bg-transparent"
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{customer.name}</span>
                      <span className="text-xs text-muted-foreground">{customer.company_name || 'Individual'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 mr-1 shrink-0" /> <span className="truncate max-w-[150px]">{customer.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 mr-1 shrink-0" /> {customer.phone || 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="block truncate max-w-[250px]" title={customer.address}>
                      {customer.address || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(customer)}>
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(customer.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCustomers}
        customer={selectedCustomer}
      />
    </div>
  );
}
