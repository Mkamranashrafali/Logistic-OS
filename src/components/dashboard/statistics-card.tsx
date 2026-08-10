import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
  iconColor?: string;
  iconBg?: string;
}

export function StatisticsCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  iconColor = "text-primary",
  iconBg = "bg-primary/10"
}: StatisticsCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border-border/60 hover:border-primary/30">
      <CardContent className="p-5">
        <div className="flex items-center justify-between space-x-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {value}
            </div>
          </div>
          <div className={cn("p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 shrink-0", iconBg, iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {description && (
          <div className="mt-3 pt-3 border-t border-border/40 flex items-center text-xs text-muted-foreground">
            {trend === "up" && (
              <span className="inline-flex items-center text-emerald-600 font-medium mr-1.5 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="h-3 w-3 mr-0.5" /> +
              </span>
            )}
            {trend === "down" && (
              <span className="inline-flex items-center text-rose-600 font-medium mr-1.5 bg-rose-500/10 px-1.5 py-0.5 rounded">
                <TrendingDown className="h-3 w-3 mr-0.5" /> -
              </span>
            )}
            <span className="truncate">{description}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
