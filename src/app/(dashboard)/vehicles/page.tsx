import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { MOCK_VEHICLES } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Filter, MoreHorizontal, FileText, Wrench } from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function VehiclesPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-muted-foreground">Manage your logistics fleet and maintenance schedules.</p>
        </div>
        <Button>Add Vehicle</Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search vehicles by plate, model..." className="pl-9 bg-background" />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Vehicle ID</TableHead>
              <TableHead>Model & Type</TableHead>
              <TableHead>License Plate</TableHead>
              <TableHead>Mileage</TableHead>
              <TableHead>Last Maintenance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_VEHICLES.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{vehicle.model}</span>
                    <span className="text-xs text-muted-foreground">{vehicle.type}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="px-2 py-1 bg-secondary rounded-md text-xs font-mono inline-block border">
                    {vehicle.plate}
                  </div>
                </TableCell>
                <TableCell>{vehicle.mileage}</TableCell>
                <TableCell>{vehicle.lastMaintenance}</TableCell>
                <TableCell>
                  <StatusBadge status={vehicle.status} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Wrench className="mr-2 h-4 w-4" /> Log Maintenance
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

