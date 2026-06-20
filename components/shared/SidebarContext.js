"use client";

import { createContext, useContext, useState } from "react";

/**
 * @typedef {{
 *   collapsed: boolean;
 *   setCollapsed: import("react").Dispatch<import("react").SetStateAction<boolean>>;
 *   mobileOpen: boolean;
 *   setMobileOpen: import("react").Dispatch<import("react").SetStateAction<boolean>>;
 * }} SidebarContextType
 */

const SidebarContext = createContext(/** @type {SidebarContextType | null} */ (null));

/** @param {{ children: import("react").ReactNode }} props */
export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

/** @returns {SidebarContextType} */
export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside SidebarProvider");
  return ctx;
}
