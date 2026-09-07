/**
 * @file detail-drawer.tsx
 * @description Standardized slide-over sheet drawer for inspecting details of orders, customers, logs, and rules.
 * Follows Open/Closed Principle (OCP) with composable header, body, and footer slots.
 */

"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export interface DetailDrawerProps {
  /** Open status */
  open: boolean
  /** Open change callback */
  onOpenChange: (open: boolean) => void
  /** Title text or node */
  title: React.ReactNode
  /** Subtitle description or badge */
  description?: React.ReactNode
  /** Drawer main body contents */
  children: React.ReactNode
  /** Drawer footer actions */
  footer?: React.ReactNode
  /** Drawer width / size */
  size?: "md" | "lg" | "xl" | "full"
  /** Custom content class */
  className?: string
}

export function DetailDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "lg",
  className,
}: DetailDrawerProps) {
  const sizeClasses = {
    md: "sm:max-w-md",
    lg: "sm:max-w-lg md:max-w-xl",
    xl: "sm:max-w-xl md:max-w-2xl lg:max-w-3xl",
    full: "sm:max-w-4xl lg:max-w-5xl",
  }[size]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          "flex flex-col gap-0 p-0 sm:border-l border-border bg-background/95 backdrop-blur-md overflow-hidden",
          sizeClasses,
          className
        )}
      >
        <SheetHeader className="border-b border-border/60 p-5 bg-card/60">
          <div className="flex items-center justify-between gap-3">
            <SheetTitle className="text-base font-bold text-foreground">
              {title}
            </SheetTitle>
          </div>
          {description && (
            <SheetDescription className="text-xs text-muted-foreground mt-1">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {children}
        </div>

        {footer && (
          <SheetFooter className="border-t border-border/60 p-4 bg-card/40 flex-row items-center justify-end gap-2">
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
