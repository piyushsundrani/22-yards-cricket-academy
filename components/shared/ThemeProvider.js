"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/** @param {{ children: import("react").ReactNode } & import("next-themes").ThemeProviderProps} props */
export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
