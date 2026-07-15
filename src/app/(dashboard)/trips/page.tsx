import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { MOCK_TRIPS } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Filter, MoreHorizontal, Eye, Navigation } from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

export default function TripsPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Trips</h1>
          <p className="text-muted-foreground">Monitor real-time status of your logistics fleet.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search trips by ID, vehicle..." className="pl-9 bg-background" />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Trip ID</TableHead>
              <TableHead>Driver & Vehicle</TableHead>
              <TableHead>Route</TableHead>
              <TableHead className="w-[200px]">Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_TRIPS.map((trip) => (
              <TableRow key={trip.id}>
                <TableCell className="font-medium">{trip.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{trip.driver}</span>
                    <span className="text-xs text-muted-foreground">{trip.vehicle}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{trip.origin}</span>
                    <Navigation className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{trip.destination}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 w-full max-w-[150px]">
                    <Progress value={trip.progress} className="h-2" />
                    <span className="text-xs text-muted-foreground text-right">{trip.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={trip.status} />
                </TableCell>
                <TableCell>{trip.eta}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" /> View Live Map
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

