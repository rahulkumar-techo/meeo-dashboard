"use client"

import * as React from "react"
import { Search, X, ShoppingBag, Box, Tag, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"

interface HeaderSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const QUICK_LINKS = [
  { label: "Orders Console", href: "/orders", icon: ShoppingBag, category: "Navigation" },
  { label: "Product Catalog", href: "/products", icon: Box, category: "Navigation" },
  { label: "Promotions & Discounts", href: "/marketing/promotions", icon: Tag, category: "Marketing" },
  { label: "Customer 360", href: "/customers/360", icon: Users, category: "Customers" },
]

export function HeaderSearchDialog({ open, onOpenChange }: HeaderSearchDialogProps) {
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  const filteredLinks = QUICK_LINKS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-lg overflow-hidden border-border bg-background shadow-2xl">
        <DialogTitle className="sr-only">Global Search</DialogTitle>
        <div className="flex items-center border-b border-border/80 px-3 py-2.5">
          <Search className="size-4 shrink-0 text-muted-foreground mr-2.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders, inventory, transactions, customers..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto p-2">
          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Navigation
          </div>
          <div className="space-y-1">
            {filteredLinks.length > 0 ? (
              filteredLinks.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center justify-between rounded-md px-2.5 py-2 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-6 items-center justify-center rounded bg-muted text-muted-foreground">
                        <Icon className="size-3.5" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <ArrowRight className="size-3.5 text-muted-foreground opacity-60" />
                  </Link>
                )
              })
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No matching results found for &ldquo;{query}&rdquo;
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground font-mono">
          <span>Navigate with ↵ Enter</span>
          <span>ESC to close</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
