import Link from "next/link"
import {
  Compass,
  ArrowLeft,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Search,
  HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4 py-12">
      {/* Big Hero Icon with Layered Glow */}
      <div className="relative mb-6 flex items-center justify-center">
        <div className="absolute -inset-4 rounded-full bg-primary/10 blur-2xl dark:bg-primary/20" />
        <div className="relative flex size-24 items-center justify-center rounded-2xl border border-border/80 bg-muted/50 p-4 shadow-lg backdrop-blur-xs sm:size-28">
          <Compass className="size-14 text-primary animate-pulse sm:size-16" />
        </div>
        <Badge
          variant="secondary"
          className="absolute -bottom-2.5 rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] font-bold shadow-xs uppercase tracking-wider"
        >
          404 Not Found
        </Badge>
      </div>

      {/* Heading & Details */}
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
        Admin Route Not Found
      </h1>
      <p className="mt-2.5 max-w-md text-sm text-muted-foreground sm:text-base">
        The requested resource, sub-module, or route does not exist or has been relocated within the admin workspace.
      </p>

      {/* Primary Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          render={<Link href="/" />}
          size="default"
          className="gap-2 font-medium shadow-xs"
        >
          <LayoutDashboard className="size-4" />
          <span>Go to Dashboard</span>
        </Button>
        <Button
          render={<Link href="/orders" />}
          variant="outline"
          size="default"
          className="gap-2 font-medium"
        >
          <ShoppingCart className="size-4" />
          <span>View Orders</span>
        </Button>
      </div>

      {/* Quick Discovery Cards */}
      <div className="mt-12 w-full max-w-lg rounded-xl border border-border/60 bg-muted/20 p-4 text-left">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          <Search className="size-3.5" />
          <span>Popular Admin Destinations</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Link
            href="/products"
            className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-background/80 p-2.5 text-xs font-medium text-foreground transition-colors hover:border-border hover:bg-muted"
          >
            <Package className="size-4 text-primary" />
            <span>Product Catalog</span>
          </Link>
          <Link
            href="/system-health"
            className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-background/80 p-2.5 text-xs font-medium text-foreground transition-colors hover:border-border hover:bg-muted"
          >
            <HelpCircle className="size-4 text-primary" />
            <span>System Health & Logs</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
