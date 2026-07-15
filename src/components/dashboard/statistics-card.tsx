import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
}

export function StatisticsCard({ title, value, icon: Icon, description, trend }: StatisticsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend === "up" && <span className="text-success font-medium mr-1">?</span>}
            {trend === "down" && <span className="text-destructive font-medium mr-1">?</span>}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
