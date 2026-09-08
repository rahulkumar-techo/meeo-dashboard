/**
 * @file checkout-simulation-pane.tsx
 * @description QA simulation workbench for testing end-to-end checkout holds, payment outcomes, and automated expired hold cleanup sweeper.
 */

"use client"

import * as React from "react"
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Zap,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  useSimulateCheckoutMutation,
  useCleanupExpiredReservationsMutation,
} from "@/hooks/use-inventory-query"
import type {
  InventoryRecord,
  CheckoutSimulationResponseData,
  CleanupExpiredResponseData,
} from "@/types/inventory"

export interface CheckoutSimulationPaneProps {
  items: InventoryRecord[]
  onSuccess?: () => void
}

export function CheckoutSimulationPane({
  items,
  onSuccess,
}: CheckoutSimulationPaneProps) {
  // State for QA simulator
  const [selectedVariantId, setSelectedVariantId] = React.useState<string>(
    items[0]?.variantId || ""
  )
  const [quantity, setQuantity] = React.useState<number>(1)
  const [paymentSuccess, setPaymentSuccess] = React.useState<boolean>(true)
  const [holdMinutes, setHoldMinutes] = React.useState<number>(15)
  const [simulationResult, setSimulationResult] =
    React.useState<CheckoutSimulationResponseData | null>(null)
  const [simulationError, setSimulationError] = React.useState<string | null>(
    null
  )

  // State for expired sweeper
  const [sweeperResult, setSweeperResult] =
    React.useState<CleanupExpiredResponseData | null>(null)
  const [sweeperError, setSweeperError] = React.useState<string | null>(null)

  const simulateMutation = useSimulateCheckoutMutation()
  const cleanupMutation = useCleanupExpiredReservationsMutation()

  // Auto-select first item if not set
  React.useEffect(() => {
    if (!selectedVariantId && items.length > 0) {
      setSelectedVariantId(items[0].variantId)
    }
  }, [items, selectedVariantId])

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVariantId) {
      setSimulationError("Please select a product variant to simulate.")
      return
    }

    try {
      setSimulationError(null)
      const res = await simulateMutation.mutateAsync({
        variantId: selectedVariantId,
        quantity: Number(quantity) || 1,
        simulatePaymentSuccess: paymentSuccess,
        holdMinutes: Number(holdMinutes) || 15,
      })
      setSimulationResult(res.data)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Simulation execution failed."
      setSimulationError(msg)
      setSimulationResult(null)
    }
  }

  const handleRunSweeper = async () => {
    try {
      setSweeperError(null)
      const res = await cleanupMutation.mutateAsync()
      setSweeperResult(res.data)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to run expired sweeper."
      setSweeperError(msg)
    }
  }

  const selectedItem = items.find((i) => i.variantId === selectedVariantId)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Interactive Simulation Workbench */}
      <div className="lg:col-span-7 space-y-4">
        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1 text-primary">
            <Zap className="size-5" />
            <h3 className="text-base font-semibold text-foreground">
              End-to-End Checkout Flow Simulator
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Test the entire checkout lifecycle in an atomic testbed: Reserve stock with TTL hold &rarr; Simulate gateway payment response &rarr; Commit permanent sale or auto-release back to pool.
          </p>

          <form onSubmit={handleRunSimulation} className="space-y-4">
            {simulationError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{simulationError}</span>
              </div>
            )}

            {/* Variant Selector */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Target Product Variant
              </label>
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden font-mono"
              >
                {items.map((item) => (
                  <option key={item.variantId} value={item.variantId}>
                    {item.variant?.product?.name || "Product"} — SKU: {item.variant?.sku || item.variantId} (Avail: {item.availableQuantity})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity & Hold Minutes */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Test Hold Quantity
                </label>
                <Input
                  type="number"
                  min={1}
                  max={selectedItem?.availableQuantity || 100}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="h-9 font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Hold Duration TTL (Min)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={holdMinutes}
                  onChange={(e) => setHoldMinutes(Math.max(1, parseInt(e.target.value, 10) || 15))}
                  className="h-9 font-mono text-sm"
                  required
                />
              </div>
            </div>

            {/* Payment Scenario Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/30 p-3">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Simulate Successful Payment
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {paymentSuccess
                    ? "Payment succeeds &rarr; hold is committed to confirmed order (permanent sold)."
                    : "Payment fails/declines &rarr; hold is automatically released and restored to available stock."}
                </p>
              </div>
              <Switch
                checked={paymentSuccess}
                onCheckedChange={setPaymentSuccess}
              />
            </div>

            <Button
              type="submit"
              disabled={simulateMutation.isPending || !selectedVariantId}
              className="w-full gap-2 bg-primary text-primary-foreground font-semibold h-9"
            >
              {simulateMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Executing Simulation...</span>
                </>
              ) : (
                <>
                  <Play className="size-4 fill-current" />
                  <span>Run Checkout Simulation</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Simulation Output Timeline */}
        {simulationResult && (
          <div className="rounded-xl border border-border/70 bg-card p-5 shadow-2xs animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-600" />
                <h4 className="text-sm font-semibold text-foreground">
                  Simulation Execution Trace
                </h4>
              </div>
              <Badge
                variant={
                  simulationResult.flowStatus === "ORDER_COMPLETED"
                    ? "default"
                    : "outline"
                }
                className={
                  simulationResult.flowStatus === "ORDER_COMPLETED"
                    ? "bg-emerald-600 text-white font-mono text-[10.5px]"
                    : "bg-amber-500/10 text-amber-600 border-amber-300 font-mono text-[10.5px]"
                }
              >
                {simulationResult.flowStatus}
              </Badge>
            </div>

            <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
              {simulationResult.timeline.map((step) => {
                const isSuccess = step.status === "SUCCESS" || step.status === "COMPLETED" || step.status === "RESTORED"
                const isFail = step.status === "FAILED"

                return (
                  <div key={step.step} className="flex items-start gap-3 relative pl-1">
                    <div
                      className={`size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
                        isFail
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      }`}
                    >
                      {isFail ? <XCircle className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                    </div>
                    <div className="flex-1 bg-muted/40 rounded-lg p-2.5 border border-border/50 text-xs">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold font-mono text-foreground">
                          {step.action}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {step.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{step.message}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {simulationResult.finalInventory && (
              <div className="mt-4 rounded-lg bg-muted/60 p-3 text-xs flex items-center justify-between font-mono">
                <span className="text-muted-foreground">Updated Variant Stock State:</span>
                <div className="flex items-center gap-3">
                  <span>Available: <b className="text-emerald-600">{simulationResult.finalInventory.availableQuantity}</b></span>
                  <span>•</span>
                  <span>Reserved: <b className="text-cyan-600">{simulationResult.finalInventory.reservedQuantity}</b></span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Expired Hold Sweeper & State Invariants */}
      <div className="lg:col-span-5 space-y-4">
        {/* Background Sweeper Card */}
        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-1 text-amber-600">
            <Clock className="size-5" />
            <h3 className="text-base font-semibold text-foreground">
              Stale Reservations Sweeper
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Scans for all abandoned cart reservations past their TTL expiration window, marks them as <code className="text-foreground font-mono">EXPIRED</code>, and automatically returns units back to the available inventory pool.
          </p>

          {sweeperError && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive mb-3">
              <AlertCircle className="size-4 shrink-0" />
              <span>{sweeperError}</span>
            </div>
          )}

          {sweeperResult && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-800 dark:text-emerald-300 mb-3 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="size-4" />
                <span>Sweeper Execution Completed</span>
              </div>
              <p className="text-[11px]">
                Cleaned up <b>{sweeperResult.expiredCount}</b> stale holds &bull; Restored{" "}
                <b>{sweeperResult.restoredUnits}</b> units to available pool.
              </p>
            </div>
          )}

          <Button
            onClick={handleRunSweeper}
            disabled={cleanupMutation.isPending}
            variant="outline"
            className="w-full gap-2 border-amber-500/40 hover:bg-amber-500/10 text-foreground font-medium h-9 text-xs"
          >
            {cleanupMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Scanning Expired Holds...</span>
              </>
            ) : (
              <>
                <RotateCcw className="size-3.5" />
                <span>Run Expired Reservations Sweeper</span>
              </>
            )}
          </Button>
        </div>

        {/* State Machine & Stock Invariants Card */}
        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span>Stock Invariants & State Machine</span>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="rounded-lg bg-muted/40 p-2.5 font-mono text-[11px]">
              <p className="font-semibold text-foreground">totalStock = available + reserved</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Purchasable units strictly bounded by available quantity.</p>
            </div>

            <ul className="space-y-1.5 list-disc list-inside text-[11.5px]">
              <li><strong className="text-foreground">ACTIVE Hold</strong>: Held during checkout with configurable TTL (default 15m).</li>
              <li><strong className="text-foreground">CONFIRMED (Sold)</strong>: Payment complete; units permanently decremented into revenue orders.</li>
              <li><strong className="text-foreground">RELEASED / EXPIRED</strong>: Cancellation or timeout auto-restores units to available stock.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
