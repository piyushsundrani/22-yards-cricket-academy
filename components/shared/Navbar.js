"use client";

import { useEffect, useState } from "react";
import { Bell, Menu } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/components/shared/SidebarContext";

/** @param {{ title: string }} props */
export default function Navbar({ title }) {
  const [user, setUser] = useState(
    /** @type {import("@supabase/supabase-js").User | null} */ (null)
  );
  const { setMobileOpen } = useSidebar();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "CA";

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden flex-shrink-0"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
          <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-[#0d1b2a] text-white text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-xs text-gray-500">{user?.email}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
