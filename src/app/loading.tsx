import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4 py-12">
      <div className="relative mb-4 flex items-center justify-center">
        <div className="absolute -inset-3 rounded-full bg-primary/10 blur-xl dark:bg-primary/20" />
        <div className="relative flex size-20 items-center justify-center rounded-2xl border border-border/80 bg-muted/40 p-4 shadow-sm backdrop-blur-xs">
          <Loader2 className="size-10 text-primary animate-spin" />
        </div>
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-foreground tracking-tight">
          Loading Admin Module...
        </h3>
        <p className="text-xs text-muted-foreground">
          Fetching real-time store metrics and operational state
        </p>
      </div>
    </div>
  )
}
