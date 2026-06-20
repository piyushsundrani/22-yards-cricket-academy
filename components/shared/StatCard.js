import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * @param {{
 *   title: string;
 *   value: string | number;
 *   icon?: import("react").ComponentType<{ className?: string }>;
 *   trend?: string;
 *   color?: "green" | "gold" | "red" | "blue" | "orange";
 *   loading?: boolean;
 * }} props
 */
export default function StatCard({ title, value, icon: Icon, trend, color = "green", loading }) {
  const colorMap = {
    green: "bg-[#0d1b2a]/10 text-[#0d1b2a]",
    gold: "bg-[#c9a84c]/10 text-[#c9a84c]",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-8 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
            {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
          </div>
          {Icon && (
            <div className={cn("p-3 rounded-xl", colorMap[color])}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
