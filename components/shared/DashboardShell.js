"use client";

import { SidebarProvider, useSidebar } from "@/components/shared/SidebarContext";
import Sidebar from "@/components/shared/Sidebar";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

/** @param {{ children: import("react").ReactNode }} props */
function Shell({ children }) {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <div className="flex min-h-screen">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar />

      <main
        className={cn(
          "flex-1 min-w-0 transition-all duration-300",
          collapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        {children}
      </main>
    </div>
  );
}

/** @param {{ children: import("react").ReactNode }} props */
export default function DashboardShell({ children }) {
  return (
    <SidebarProvider>
      <TooltipProvider delayDuration={200}>
        <Shell>{children}</Shell>
      </TooltipProvider>
    </SidebarProvider>
  );
}
