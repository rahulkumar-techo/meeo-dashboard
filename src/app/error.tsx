"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertTriangle,
  RotateCcw,
  LayoutDashboard,
  Activity,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  const [showDetails, setShowDetails] = React.useState(false)

  React.useEffect(() => {
    // Log the error to an error reporting service or console
    console.error("Admin Dashboard Runtime Error:", error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4 py-12">
      {/* Big Hero Error Icon with Destructive Glow */}
      <div className="relative mb-6 flex items-center justify-center">
        <div className="absolute -inset-4 rounded-full bg-destructive/15 blur-2xl" />
        <div className="relative flex size-24 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 p-4 shadow-lg sm:size-28">
          <AlertTriangle className="size-14 text-destructive sm:size-16" />
        </div>
        <Badge
          variant="destructive"
          className="absolute -bottom-2.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold shadow-xs uppercase tracking-wider"
        >
          Execution Error
        </Badge>
      </div>

      {/* Heading & Details */}
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-2.5 max-w-md text-sm text-muted-foreground sm:text-base">
        An unexpected error occurred while processing this dashboard module. Our telemetry system has logged this incident.
      </p>

      {/* Primary Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          size="default"
          className="gap-2 font-medium shadow-xs"
        >
          <RotateCcw className="size-4" />
          <span>Try Again</span>
        </Button>
        <Button
          render={<Link href="/" />}
          variant="outline"
          size="default"
          className="gap-2 font-medium"
        >
          <LayoutDashboard className="size-4" />
          <span>Return to Dashboard</span>
        </Button>
        <Button
          render={<Link href="/system-health" />}
          variant="ghost"
          size="default"
          className="gap-2 font-medium text-muted-foreground hover:text-foreground"
        >
          <Activity className="size-4" />
          <span>Check System Status</span>
        </Button>
      </div>

      {/* Technical Error Details Drawer / Accordion */}
      <div className="mt-10 w-full max-w-lg text-left">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <span>Technical Diagnostics</span>
          <ChevronDown
            className={`size-4 transition-transform duration-200 ${
              showDetails ? "rotate-180" : ""
            }`}
          />
        </button>

        {showDetails && (
          <div className="mt-2 rounded-lg border border-border/80 bg-muted/60 p-3 font-mono text-xs text-muted-foreground overflow-x-auto space-y-1">
            <div className="font-semibold text-foreground">
              {error.name || "Error"}: {error.message || "Unknown error occurred"}
            </div>
            {error.digest && (
              <div className="text-[11px] text-muted-foreground/80">
                Digest ID: <span className="text-foreground">{error.digest}</span>
              </div>
            )}
            {error.stack && (
              <pre className="mt-2 max-h-36 overflow-auto text-[10px] opacity-75">
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
