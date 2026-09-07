"use client"

import * as React from "react"
import { Sun, Moon, Laptop } from "lucide-react"
import { useTheme } from "./theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn("size-8 text-muted-foreground", className)}
        aria-label="Toggle theme"
      >
        <Sun className="size-4 opacity-50" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
          className
        )}
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? (
          <Moon className="size-4 transition-transform duration-200" />
        ) : (
          <Sun className="size-4 transition-transform duration-200" />
        )}
        {showLabel && (
          <span className="ml-2 text-xs capitalize">{theme}</span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center gap-2 text-xs font-medium cursor-pointer",
            theme === "light" && "bg-accent font-semibold text-accent-foreground"
          )}
        >
          <Sun className="size-3.5" />
          <span>Light</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center gap-2 text-xs font-medium cursor-pointer",
            theme === "dark" && "bg-accent font-semibold text-accent-foreground"
          )}
        >
          <Moon className="size-3.5" />
          <span>Dark</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center gap-2 text-xs font-medium cursor-pointer",
            theme === "system" && "bg-accent font-semibold text-accent-foreground"
          )}
        >
          <Laptop className="size-3.5" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
