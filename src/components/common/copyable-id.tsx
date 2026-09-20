/**
 * @file copyable-id.tsx
 * @description Compact UI component for copying entity UUIDs (categories, brands, products) for promotion targeting.
 */

"use client"

import * as React from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "cn"

interface CopyableIdProps {
  id: string
  label?: string
  className?: string
  truncate?: boolean
}

export function CopyableId({
  id,
  label,
  className,
  truncate = true,
}: CopyableIdProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!id) return
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!id) return null

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied to clipboard!" : `Copy ${label || "ID"}: ${id}`}
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[10.5px] text-muted-foreground/80 hover:text-foreground hover:bg-muted/70 px-1.5 py-0.5 rounded transition-colors group/copy border border-transparent hover:border-border/60",
        copied && "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        className
      )}
    >
      <span className={cn(truncate && "truncate max-w-[110px] sm:max-w-[140px]")}>
        {id}
      </span>
      {copied ? (
        <Check className="size-2.5 text-emerald-500 shrink-0" />
      ) : (
        <Copy className="size-2.5 opacity-60 group-hover/copy:opacity-100 shrink-0" />
      )}
    </button>
  )
}
