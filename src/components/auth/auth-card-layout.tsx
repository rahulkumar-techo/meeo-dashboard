"use client"

import * as React from "react"
import Link from "next/link"
import { ShieldCheck, Sparkles, Layers } from "lucide-react"
import { ThemeToggle } from "@/components/theme"
import { cn } from "@/lib/utils"

interface AuthCardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string | React.ReactNode
  footerContent?: React.ReactNode
  badgeText?: string
  className?: string
}

export function AuthCardLayout({
  children,
  title,
  subtitle,
  footerContent,
  badgeText = "Enterprise Security",
  className,
}: AuthCardLayoutProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-slate-50/60 p-4 sm:p-6 md:p-8 dark:bg-background">
      {/* Background Decorative Ambient Gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-500/15 blur-3xl dark:bg-indigo-600/10" />
      <div className="pointer-events-none absolute -bottom-40 right-10 -z-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-600/10" />

      {/* Top Bar with Brand & Theme Switcher */}
      <header className="absolute top-4 left-4 right-4 flex items-center justify-between sm:top-6 sm:left-8 sm:right-8">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-500/30">
            <Layers className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-base font-bold tracking-tight text-foreground">
              Meeo
            </span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Control Center
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Auth Main Card */}
      <main className={cn("w-full max-w-md my-auto pt-16 sm:pt-12", className)}>
        <div className="rounded-2xl border border-border/80 bg-card/95 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-md sm:p-8 dark:border-border/60 dark:bg-card/90 dark:shadow-2xl dark:shadow-black/40">
          {/* Header Section */}
          <div className="mb-6 flex flex-col items-center text-center">
            {badgeText && (
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50/70 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300">
                <ShieldCheck className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{badgeText}</span>
              </div>
            )}

            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>

            {subtitle && (
              <div className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
                {subtitle}
              </div>
            )}
          </div>

          {/* Form Content */}
          <div>{children}</div>

          {/* Footer Section */}
          {footerContent && (
            <div className="mt-6 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
              {footerContent}
            </div>
          )}
        </div>

        {/* Global Security Subtext */}
        <div className="mt-6 flex items-center justify-center gap-4 text-center text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Sparkles className="size-3 text-indigo-500" />
            256-bit Encrypted Session
          </span>
          <span>•</span>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
        </div>
      </main>
    </div>
  )
}
