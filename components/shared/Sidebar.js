"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UserPlus,
  CreditCard,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useSidebar } from "@/components/shared/SidebarContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/registration", label: "Registration", icon: UserPlus },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/staff", label: "Staff", icon: Users },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export default function Sidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/login");
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-[#0d1b2a] text-white transition-all duration-300 fixed left-0 top-0 z-40 shadow-xl",
        // Mobile: always full width; desktop: collapse toggles width
        "w-64",
        collapsed ? "lg:w-16" : "lg:w-64",
        // Mobile: slide in/out; desktop: always visible
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <img
          src="/22-yards.jpeg"
          alt="22 Yards Cricket Academy"
          style={{
            width: collapsed ? 32 : 44,
            height: collapsed ? 32 : 44,
            borderRadius: 8,
            flexShrink: 0,
          }}
        />
        {/* Mobile: always show; desktop: hide when collapsed */}
        <div className={collapsed ? "block lg:hidden" : ""}>
          <p className="font-bold text-sm leading-tight">22 Yards</p>
          <p className="text-xs text-white/60">Cricket Academy</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
              pathname.startsWith(href)
                ? "bg-white/20 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {/* Mobile: always show; desktop: hide when collapsed */}
            <span className={collapsed ? "block lg:hidden" : ""}>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 border-t border-white/10 pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className={collapsed ? "block lg:hidden" : ""}>Logout</span>
        </button>
      </div>

      {/* Collapse toggle — desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-[#0d1b2a] border border-white/20 rounded-full p-1 text-white hover:bg-[#1a2f4a] transition-colors hidden lg:flex"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
