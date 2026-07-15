import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
      case "available":
      case "active":
        return "bg-success/15 text-success hover:bg-success/20 border-0";
      case "delayed":
      case "pending":
      case "maintenance":
      case "busy":
        return "bg-warning/15 text-warning hover:bg-warning/20 border-0";
      case "offline":
      case "cancelled":
        return "bg-destructive/15 text-destructive hover:bg-destructive/20 border-0";
      case "in transit":
      case "assigned":
        return "bg-primary/15 text-primary hover:bg-primary/20 border-0";
      default:
        return "bg-muted text-muted-foreground hover:bg-muted/80 border-0";
    }
  };

  return (
    <Badge variant="outline" className={cn("font-medium", getStatusColor(status))}>
      {status}
    </Badge>
  );
}
