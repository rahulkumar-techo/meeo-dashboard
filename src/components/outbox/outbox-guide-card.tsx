/**
 * @file outbox-guide-card.tsx
 * @description Contextual onboarding and architecture explanation card for Site Reliability Engineers (SRE) and DevOps.
 * Details Transactional Outbox Pattern, At-Least-Once Delivery, BullMQ Redis Architecture, and DLQ Recovery Playbook.
 */

"use client"

import * as React from "react"
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  Database,
  Radio,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function OutboxGuideCard() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-background to-indigo-500/5 p-4 shadow-2xs transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Transactional Outbox Pattern & Background Workers Architecture
            </h3>
            <p className="text-xs text-muted-foreground">
              Learn about atomic dual-write prevention, BullMQ Redis queues, consumer idempotency, and DLQ recovery.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <span>{isOpen ? "Hide Architecture" : "View Outbox Architecture"}</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isOpen && (
        <div className="mt-4 grid gap-3 border-t border-border/60 pt-3 md:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="rounded-lg border border-border/60 bg-card p-3 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-indigo-600 dark:text-indigo-400">
              <Database className="h-4 w-4" />
              <span>PostgreSQL Atomicity</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Business mutations (e.g. Orders, Payments) and domain events are written within the <strong>same ACID transaction</strong>, guaranteeing zero dual-write data loss.
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-3 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
              <Layers className="h-4 w-4" />
              <span>Distributed Poller Lock</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              The outbox poller claims batches with a distributed lock (<code className="text-[11px]">lockedBy</code>) to prevent split-brain processing across clustered API nodes.
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-3 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-cyan-600 dark:text-cyan-400">
              <Radio className="h-4 w-4" />
              <span>BullMQ Queue Broker</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Published events are enqueued into Redis BullMQ (<code className="text-[11px]">domain-events</code>) with 3 retries, exponential backoff (2000ms), and 24h retention.
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-card p-3 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-rose-600 dark:text-rose-400">
              <RotateCcw className="h-4 w-4" />
              <span>DLQ Recovery Playbook</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Exhausted retries move events to <code className="text-[11px]">dead-letter-events</code>. SREs can inspect error stack traces, click <strong>Manual Retry</strong>, and force immediate publishing.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
