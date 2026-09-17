/**
 * @file raw-prometheus-viewer.tsx
 * @description Searchable and copyable Raw Prometheus /metrics text exposition viewer.
 */

"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileCode, Search, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface RawPrometheusViewerProps {
  rawText?: string
  className?: string
}

export function RawPrometheusViewer({ rawText = "", className }: RawPrometheusViewerProps) {
  const [search, setSearch] = React.useState("")
  const [hasCopied, setHasCopied] = React.useState(false)

  const handleCopy = async () => {
    if (!rawText) return
    try {
      await navigator.clipboard.writeText(rawText)
      setHasCopied(true)
      setTimeout(() => setHasCopied(false), 2000)
    } catch {}
  }

  const lines = React.useMemo(() => {
    const rawLines = rawText.split("\n")
    if (!search.trim()) return rawLines
    const q = search.toLowerCase()
    return rawLines.filter((l) => l.toLowerCase().includes(q))
  }, [rawText, search])

  return (
    <Card className={cn("border-border/70 shadow-2xs bg-card", className)}>
      <CardHeader className="p-4 pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileCode className="size-4 text-indigo-600 dark:text-indigo-400" />
            <span>Raw Prometheus /metrics Output</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Standard OpenMetrics exposition format text stream directly from the Fastify server
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter metric names..."
              className="h-7.5 pl-7.5 text-xs bg-muted/20"
            />
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="h-7.5 text-xs gap-1.5 font-medium"
          >
            {hasCopied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
            <span>{hasCopied ? "Copied" : "Copy Raw"}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="rounded-xl border border-border/80 bg-muted/30 p-4 font-mono text-xs max-h-[500px] overflow-y-auto overflow-x-auto space-y-0.5 text-foreground">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className={cn(
                "whitespace-pre",
                line.startsWith("# HELP") && "text-muted-foreground italic",
                line.startsWith("# TYPE") && "text-sky-600 dark:text-sky-400 font-semibold",
                !line.startsWith("#") && line.trim() && "text-indigo-600 dark:text-indigo-300 font-bold"
              )}
            >
              {line}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
