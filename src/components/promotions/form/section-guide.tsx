/**
 * @file section-guide.tsx
 * @description Collapsible section header and helper guide for promotion form sections.
 */

"use client"

import * as React from "react"
import { ChevronDown, HelpCircle, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SectionGuideProps {
  icon: LucideIcon
  iconColor?: string
  title: string
  description: string
  tips?: string[]
  defaultOpen?: boolean
}

export function SectionHeaderGuide({
  icon: Icon,
  iconColor = "text-indigo-500",
  title,
  description,
  tips = [],
  defaultOpen = false,
}: SectionGuideProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className="border-b border-border/50 pb-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={cn("size-4 shrink-0", iconColor)} />
          <h3 className="text-sm font-bold tracking-tight text-foreground truncate">
            {title}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors border border-transparent hover:border-border/60"
          title={isOpen ? "Minimize guide" : "Expand guide"}
        >
          <HelpCircle className="size-3 text-muted-foreground/70" />
          <span>{isOpen ? "Hide Guide" : "Field Guide"}</span>
          <ChevronDown
            className={cn(
              "size-3 text-muted-foreground/70 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Collapsible description & tips (minimized by default) */}
      {isOpen && (
        <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground space-y-1.5 animate-in fade-in duration-150">
          <p className="leading-relaxed text-foreground/90">{description}</p>
          {tips.length > 0 && (
            <ul className="list-disc list-inside space-y-0.5 text-[11.5px] text-muted-foreground">
              {tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
