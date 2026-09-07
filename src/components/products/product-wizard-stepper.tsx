/**
 * @file product-wizard-stepper.tsx
 * @description 3-Step visual progress indicator for product creation workflow.
 */

"use client"

import * as React from "react"
import { Check, FileText, Image as ImageIcon, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ProductWizardStepperProps {
  currentStep: 1 | 2 | 3
  completedSteps: number[]
  onStepClick?: (step: 1 | 2 | 3) => void
}

const STEPS = [
  { step: 1, title: "1. Create Draft", desc: "Basic info & taxonomy", icon: FileText },
  { step: 2, title: "2. Upload Media", desc: "Gallery & image assets", icon: ImageIcon },
  { step: 3, title: "3. Review & Publish", desc: "Activate in catalog", icon: Rocket },
] as const

export function ProductWizardStepper({
  currentStep,
  completedSteps,
  onStepClick,
}: ProductWizardStepperProps) {
  return (
    <div className="w-full bg-card rounded-xl border border-border/70 p-4 shadow-2xs">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        {STEPS.map((s) => {
          const isCompleted = completedSteps.includes(s.step)
          const isCurrent = currentStep === s.step
          const isClickable = isCompleted && onStepClick

          const Icon = s.icon

          return (
            <div
              key={s.step}
              onClick={() => isClickable && onStepClick(s.step as 1 | 2 | 3)}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-lg border transition-all",
                isCurrent
                  ? "border-indigo-500/50 bg-indigo-500/5 dark:bg-indigo-950/20 shadow-xs"
                  : isCompleted
                  ? "border-border/60 bg-muted/20 cursor-pointer hover:bg-muted/40"
                  : "border-border/40 opacity-60 bg-background/50"
              )}
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold transition-colors",
                  isCompleted
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="size-4" /> : <Icon className="size-4" />}
              </div>

              <div className="min-w-0">
                <p
                  className={cn(
                    "text-xs font-bold truncate",
                    isCurrent
                      ? "text-indigo-600 dark:text-indigo-400"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {s.title}
                </p>
                <p className="text-[10.5px] text-muted-foreground truncate">{s.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
