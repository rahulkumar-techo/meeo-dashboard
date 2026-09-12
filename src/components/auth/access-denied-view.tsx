/**
 * @file access-denied-view.tsx
 * @description Inline 403 Forbidden Access Restricted view when navigating to unauthorized routes.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { ShieldX, ArrowLeft, Home, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface AccessDeniedViewProps {
  requiredPermission?: string | null
  pathname?: string
}

export function AccessDeniedView({
  requiredPermission,
  pathname,
}: AccessDeniedViewProps) {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-5">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 shadow-inner ring-6 ring-amber-50/50 dark:ring-amber-950/30">
          <ShieldX className="size-7" />
        </div>

        <div className="space-y-1.5">
          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-mono text-[10px]">
            403 FORBIDDEN
          </Badge>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Access Restricted
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You do not have permission to view or manage this section.
          </p>
        </div>

        {requiredPermission && (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-1.5 font-mono text-[11px]">
              <Lock className="size-3 text-muted-foreground" />
              <span>Required Permission:</span>
              <span className="font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                {requiredPermission}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="gap-1.5 text-xs"
          >
            <ArrowLeft className="size-3.5" />
            <span>Go Back</span>
          </Button>

          <Button
            render={<Link href="/" />}
            size="sm"
            className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Home className="size-3.5" />
            <span>Dashboard</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
