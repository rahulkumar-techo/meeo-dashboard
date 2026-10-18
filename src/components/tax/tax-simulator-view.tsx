/**
 * @file tax-simulator-view.tsx
 * @description Interactive GST Place of Supply (POS) & Tax Rate Simulator.
 * Allows compliance officers and developers to simulate quotes, verify intra vs inter-state splits,
 * test promotional discount deductions, calculate shipping GST, and generate Rule 46 compliant invoice previews.
 */

"use client"

import * as React from "react"
import {
  Calculator,
  Plus,
  Trash2,
  RefreshCw,
  Receipt,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building,
} from "lucide-react"
import { useTaxQuoteMutation, useTaxRulesQuery } from "@/hooks/use-tax-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  INDIAN_GST_STATES,
  type TaxQuotePayload,
  type TaxQuoteResult,
  type TaxQuoteItemInput,
} from "@/types/tax"

export function TaxSimulatorView() {
  const [sellerState, setSellerState] = React.useState("27") // Maharashtra
  const [customerState, setCustomerState] = React.useState("27") // Maharashtra
  const [shippingFee, setShippingFee] = React.useState<number>(100)

  // Items
  const [items, setItems] = React.useState<TaxQuoteItemInput[]>([
    {
      hsnCode: "84713010",
      taxableAmount: 45000,
      quantity: 1,
      discountAmount: 2000,
    },
    {
      hsnCode: "85183000",
      taxableAmount: 2500,
      quantity: 2,
      discountAmount: 0,
    },
  ])

  const [quoteResult, setQuoteResult] = React.useState<TaxQuoteResult | null>(null)

  const quoteMutation = useTaxQuoteMutation()
  const { data: rulesData } = useTaxRulesQuery()
  const activeRules = React.useMemo(
    () => rulesData?.rules ?? [],
    [rulesData]
  )

  const isInterState = sellerState !== customerState

  const sellerStateObj = INDIAN_GST_STATES.find((s) => s.code === sellerState)
  const customerStateObj = INDIAN_GST_STATES.find((s) => s.code === customerState)

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        hsnCode: "84713010",
        taxableAmount: 1000,
        quantity: 1,
        discountAmount: 0,
      },
    ])
  }

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleItemChange = (
    index: number,
    field: keyof TaxQuoteItemInput,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return { ...item, [field]: value }
        }
        return item
      })
    )
  }

  // Calculate quote (hits backend /tax/quote or client calculation fallback)
  const handleCalculate = async () => {
    const payload: TaxQuotePayload = {
      sellerStateCode: sellerState,
      customerStateCode: customerState,
      items: items.map((it) => ({
        hsnCode: it.hsnCode,
        taxableAmount: Number(it.taxableAmount),
        quantity: Number(it.quantity),
        discountAmount: Number(it.discountAmount || 0),
      })),
      shippingFee: Number(shippingFee || 0),
    }

    try {
      const res = await quoteMutation.mutateAsync(payload)
      if (res?.data) {
        setQuoteResult(res.data)
        return
      }
    } catch {
      // Fallback: Statutory precision client-side simulation
      runClientFallbackCalculation()
    }
  }

  const runClientFallbackCalculation = () => {
    let totalTaxable = 0
    let totalCgst = 0
    let totalSgst = 0
    let totalIgst = 0
    let totalTax = 0

    const itemsBreakdown = items.map((item) => {
      const baseValue =
        item.taxableAmount * item.quantity - (item.discountAmount || 0)
      const taxable = Math.max(0, baseValue)

      // Look up active rule or default to 18%
      const rule = activeRules.find(
        (r) => r.hsnCode === item.hsnCode && r.status === "ACTIVE"
      )
      const igstRate = rule ? rule.igstRate : 18
      const cgstRate = rule ? rule.cgstRate : 9
      const sgstRate = rule ? rule.sgstRate : 9

      let itemCgst = 0
      let itemSgst = 0
      let itemIgst = 0

      if (isInterState) {
        itemIgst = Number(((taxable * igstRate) / 100).toFixed(2))
      } else {
        itemCgst = Number(((taxable * cgstRate) / 100).toFixed(2))
        itemSgst = Number(((taxable * sgstRate) / 100).toFixed(2))
      }

      const itemTax = isInterState ? itemIgst : itemCgst + itemSgst
      const itemTotal = taxable + itemTax

      totalTaxable += taxable
      totalCgst += itemCgst
      totalSgst += itemSgst
      totalIgst += itemIgst
      totalTax += itemTax

      return {
        hsnCode: item.hsnCode,
        taxableAmount: taxable,
        cgstRate: isInterState ? 0 : cgstRate,
        cgstAmount: itemCgst,
        sgstRate: isInterState ? 0 : sgstRate,
        sgstAmount: itemSgst,
        igstRate: isInterState ? igstRate : 0,
        igstAmount: itemIgst,
        totalTax: itemTax,
        totalAmount: itemTotal,
      }
    })

    // Shipping tax: standard 18% GST on freight
    const shippingTaxable = Number(shippingFee || 0)
    let shippingCgst = 0
    let shippingSgst = 0
    let shippingIgst = 0

    if (isInterState) {
      shippingIgst = Number(((shippingTaxable * 18) / 100).toFixed(2))
    } else {
      shippingCgst = Number(((shippingTaxable * 9) / 100).toFixed(2))
      shippingSgst = Number(((shippingTaxable * 9) / 100).toFixed(2))
    }

    const shippingTax = isInterState
      ? shippingIgst
      : shippingCgst + shippingSgst

    totalCgst += shippingCgst
    totalSgst += shippingSgst
    totalIgst += shippingIgst
    totalTax += shippingTax

    const grandTotal = totalTaxable + shippingTaxable + totalTax

    setQuoteResult({
      isInterState,
      sellerStateCode: sellerState,
      customerStateCode: customerState,
      placeOfSupplyStateCode: customerState,
      totalTaxableAmount: totalTaxable,
      totalCgstAmount: totalCgst,
      totalSgstAmount: totalSgst,
      totalIgstAmount: totalIgst,
      totalTaxAmount: totalTax,
      shippingTaxableAmount: shippingTaxable,
      shippingTaxAmount: shippingTax,
      grandTotal,
      itemsBreakdown,
      shippingBreakdown: {
        shippingFee: shippingTaxable,
        taxableValue: shippingTaxable,
        gstRate: 18,
        cgstAmount: shippingCgst,
        sgstAmount: shippingSgst,
        igstAmount: shippingIgst,
        totalTax: shippingTax,
      },
    })
  }

  // Auto-calculate initial quote
  React.useEffect(() => {
    runClientFallbackCalculation()
  }, [sellerState, customerState, shippingFee, items, isInterState, activeRules])

  return (
    <div className="space-y-6">
      {/* 1. Configuration & Place of Supply (POS) Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-4 rounded-xl border border-border/80 shadow-2xs">
        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-foreground flex items-center gap-1.5">
            <Building className="size-3.5 text-indigo-500" />
            Origin / Seller State (Location of Supplier)
          </label>
          <select
            value={sellerState}
            onChange={(e) => setSellerState(e.target.value)}
            className="w-full h-8.5 rounded-md border border-input bg-background px-3 text-xs font-medium"
          >
            {INDIAN_GST_STATES.map((state) => (
              <option key={state.code} value={state.code}>
                {state.code} — {state.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-foreground flex items-center gap-1.5">
            <Receipt className="size-3.5 text-emerald-500" />
            Destination / Customer State (Place of Supply)
          </label>
          <select
            value={customerState}
            onChange={(e) => setCustomerState(e.target.value)}
            className="w-full h-8.5 rounded-md border border-input bg-background px-3 text-xs font-medium"
          >
            {INDIAN_GST_STATES.map((state) => (
              <option key={state.code} value={state.code}>
                {state.code} — {state.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-foreground">
            Shipping &amp; Handling Charge (₹)
          </label>
          <Input
            type="number"
            value={shippingFee}
            onChange={(e) => setShippingFee(parseFloat(e.target.value) || 0)}
            className="h-8.5 text-xs font-mono"
            placeholder="100"
          />
        </div>
      </div>

      {/* POS Determination Banner */}
      <div
        className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 text-xs ${
          isInterState
            ? "border-purple-500/30 bg-purple-500/10 text-purple-900 dark:text-purple-300"
            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Badge
            variant="outline"
            className={
              isInterState
                ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30 font-bold"
                : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold"
            }
          >
            {isInterState ? "INTER-STATE SUPPLY (IGST)" : "INTRA-STATE SUPPLY (CGST + SGST)"}
          </Badge>
          <span>
            Supplier: <strong>{sellerStateObj?.name} ({sellerState})</strong> → Recipient:{" "}
            <strong>{customerStateObj?.name} ({customerState})</strong>
          </span>
        </div>

        <div className="text-[11px] font-mono">
          {isInterState
            ? "Tax Levy: Integrated GST (100% IGST)"
            : "Tax Levy: 50% CGST + 50% SGST"}
        </div>
      </div>

      {/* 2. Item Line Builder */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Cart / Order Line Items
          </h4>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddItem}
            className="h-7 text-xs gap-1"
          >
            <Plus className="size-3" />
            Add Item
          </Button>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-muted/40 border border-border/60 text-xs"
            >
              <div className="col-span-3">
                <label className="text-[10px] text-muted-foreground block">
                  HSN / SAC Code
                </label>
                <Input
                  value={item.hsnCode}
                  onChange={(e) =>
                    handleItemChange(index, "hsnCode", e.target.value)
                  }
                  className="h-7.5 text-xs font-mono bg-background"
                />
              </div>

              <div className="col-span-3">
                <label className="text-[10px] text-muted-foreground block">
                  Unit Price (₹)
                </label>
                <Input
                  type="number"
                  value={item.taxableAmount}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "taxableAmount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="h-7.5 text-xs font-mono bg-background"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] text-muted-foreground block">
                  Qty
                </label>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "quantity",
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="h-7.5 text-xs font-mono bg-background"
                />
              </div>

              <div className="col-span-3">
                <label className="text-[10px] text-muted-foreground block">
                  Discount (₹)
                </label>
                <Input
                  type="number"
                  value={item.discountAmount ?? 0}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "discountAmount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="h-7.5 text-xs font-mono bg-background"
                />
              </div>

              <div className="col-span-1 flex justify-end pt-3.5">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveItem(index)}
                  disabled={items.length <= 1}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            size="sm"
            onClick={handleCalculate}
            disabled={quoteMutation.isPending}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-xs"
          >
            <Calculator className="size-3.5" />
            Recalculate Quote
          </Button>
        </div>
      </div>

      {/* 3. Rule 46 Compliant GST Invoice Preview */}
      {quoteResult && (
        <div className="rounded-xl border border-border/80 bg-card p-6 shadow-2xs space-y-5">
          <div className="flex items-start justify-between border-b border-border/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="size-5 text-emerald-600" />
                <h3 className="text-base font-bold text-foreground">
                  Statutory GST Tax Invoice Preview
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generated pursuant to Rule 46, CGST Rules 2017 with statutory HSN and tax splits.
              </p>
            </div>

            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs px-2.5 py-0.5"
            >
              Tax Compliant
            </Badge>
          </div>

          {/* Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border/80 text-[10px] uppercase font-bold text-muted-foreground">
                <tr>
                  <th className="py-2.5 px-3">Item / HSN</th>
                  <th className="py-2.5 px-3 text-right">Taxable Value (₹)</th>
                  {!isInterState ? (
                    <>
                      <th className="py-2.5 px-3 text-center">CGST %</th>
                      <th className="py-2.5 px-3 text-right">CGST (₹)</th>
                      <th className="py-2.5 px-3 text-center">SGST %</th>
                      <th className="py-2.5 px-3 text-right">SGST (₹)</th>
                    </>
                  ) : (
                    <>
                      <th className="py-2.5 px-3 text-center">IGST %</th>
                      <th className="py-2.5 px-3 text-right">IGST (₹)</th>
                    </>
                  )}
                  <th className="py-2.5 px-3 text-right">Total Tax (₹)</th>
                  <th className="py-2.5 px-3 text-right">Line Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {quoteResult.itemsBreakdown.map((item, i) => (
                  <tr key={i} className="hover:bg-muted/20">
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-foreground">
                        HSN {item.hsnCode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {item.taxableAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    {!isInterState ? (
                      <>
                        <td className="py-2.5 px-3 text-center font-mono">
                          {item.cgstRate}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {item.cgstAmount.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          {item.sgstRate}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {item.sgstAmount.toFixed(2)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2.5 px-3 text-center font-mono">
                          {item.igstRate}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {item.igstAmount.toFixed(2)}
                        </td>
                      </>
                    )}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                      {item.totalTax.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                      {item.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}

                {/* Freight / Shipping Line */}
                {quoteResult.shippingTaxableAmount > 0 && (
                  <tr className="bg-muted/10 font-medium">
                    <td className="py-2.5 px-3">
                      <span className="text-foreground">Freight &amp; Delivery (SAC 9965)</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {quoteResult.shippingTaxableAmount.toFixed(2)}
                    </td>
                    {!isInterState ? (
                      <>
                        <td className="py-2.5 px-3 text-center font-mono">9%</td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {quoteResult.shippingBreakdown.cgstAmount.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">9%</td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {quoteResult.shippingBreakdown.sgstAmount.toFixed(2)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2.5 px-3 text-center font-mono">18%</td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {quoteResult.shippingBreakdown.igstAmount.toFixed(2)}
                        </td>
                      </>
                    )}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                      {quoteResult.shippingTaxAmount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                      {(
                        quoteResult.shippingTaxableAmount + quoteResult.shippingTaxAmount
                      ).toFixed(2)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Grand Totals Summary Card */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-80 p-3.5 rounded-xl border border-border/80 bg-muted/30 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Total Taxable Value:</span>
                <span className="font-mono text-foreground">
                  ₹{(quoteResult.totalTaxableAmount + quoteResult.shippingTaxableAmount).toFixed(2)}
                </span>
              </div>

              {!isInterState ? (
                <>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Central GST (CGST):</span>
                    <span className="font-mono text-foreground">
                      ₹{quoteResult.totalCgstAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>State GST (SGST):</span>
                    <span className="font-mono text-foreground">
                      ₹{quoteResult.totalSgstAmount.toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-muted-foreground">
                  <span>Integrated GST (IGST):</span>
                  <span className="font-mono text-foreground font-semibold">
                    ₹{quoteResult.totalIgstAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground border-t border-border/60 pt-1.5">
                <span>Total GST Amount:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  ₹{quoteResult.totalTaxAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold text-foreground border-t border-border/80 pt-2">
                <span>Invoice Grand Total:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  ₹{quoteResult.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
