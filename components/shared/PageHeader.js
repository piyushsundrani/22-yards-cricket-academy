import { cn } from "@/lib/utils";

/**
 * @param {{ title: string; description?: string; action?: import("react").ReactNode; className?: string }} props
 */
export default function PageHeader({ title, description, action, className = "" }) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6",
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
