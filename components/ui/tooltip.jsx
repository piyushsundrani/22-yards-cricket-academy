"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef(
  /**
   * @param {{ className?: string; sideOffset?: number; side?: "top" | "right" | "bottom" | "left"; children?: React.ReactNode }} props
   * @param {React.Ref<HTMLDivElement>} ref
   */
  ({ className = "", sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 overflow-hidden rounded-md bg-[#0d1b2a] px-2.5 py-1 text-xs font-medium text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 dark:bg-gray-100 dark:text-gray-900",
          className
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/**
 * Icon-only button with a tooltip and a matching accessible label.
 * Disabled buttons don't receive pointer events, so the trigger is a wrapping
 * span to keep the tooltip working (e.g. "Already inactive").
 * @param {{
 *   label: string;
 *   onClick?: () => void;
 *   disabled?: boolean;
 *   className?: string;
 *   children: React.ReactNode;
 * }} props
 */
function IconActionButton({ label, onClick, disabled = false, className = "", children }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex" tabIndex={disabled ? 0 : -1}>
          <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className={cn(
              "p-1.5 rounded-md transition-colors text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none",
              className
            )}
          >
            {children}
          </button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, IconActionButton };
