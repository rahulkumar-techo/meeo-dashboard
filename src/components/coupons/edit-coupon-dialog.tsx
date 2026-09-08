/**
 * @file edit-coupon-dialog.tsx
 * @description Modal dialog for updating existing promotional coupon rules, limits, validity dates, and status.
 */

"use client"

import * as React from "react"
import { Edit3, Tag, AlertCircle, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUpdateCouponMutation } from "@/hooks/use-coupon-query"
import type { Coupon, CouponType, CouponStatus, UpdateCouponPayload } from "@/types/coupon"

interface EditCouponDialogProps {
  coupon: Coupon | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditCouponDialog({
  coupon,
  open,
  onOpenChange,
  onSuccess,
}: EditCouponDialogProps) {
  const [code, setCode] = React.useState("")
  const [type, setType] = React.useState<CouponType>("PERCENTAGE")
  const [value, setValue] = React.useState<string>("20")
  const [minimumOrderAmount, setMinimumOrderAmount] = React.useState<string>("")
  const [maximumDiscountAmount, setMaximumDiscountAmount] = React.useState<string>("")
  const [usageLimit, setUsageLimit] = React.useState<string>("")
  const [usageLimitPerUser, setUsageLimitPerUser] = React.useState<string>("1")
  const [startsAt, setStartsAt] = React.useState<string>("")
  const [expiresAt, setExpiresAt] = React.useState<string>("")
  const [status, setStatus] = React.useState<CouponStatus>("ACTIVE")
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const updateCouponMutation = useUpdateCouponMutation()

  React.useEffect(() => {
    if (open && coupon) {
      setCode(coupon.code)
      setType(coupon.type)
      setValue(coupon.value.toString())
      setMinimumOrderAmount(
        coupon.minimumOrderAmount != null ? coupon.minimumOrderAmount.toString() : ""
      )
      setMaximumDiscountAmount(
        coupon.maximumDiscountAmount != null ? coupon.maximumDiscountAmount.toString() : ""
      )
      setUsageLimit(coupon.usageLimit != null ? coupon.usageLimit.toString() : "")
      setUsageLimitPerUser(
        coupon.usageLimitPerUser != null ? coupon.usageLimitPerUser.toString() : ""
      )
      setStartsAt(
        coupon.startsAt ? new Date(coupon.startsAt).toISOString().slice(0, 16) : ""
      )
      setExpiresAt(
        coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : ""
      )
      setStatus(coupon.status)
      setErrorMsg(null)
    }
  }, [open, coupon])

  if (!coupon) return null

  const parsedValue = parseFloat(value) || 0
  const isPercentage = type === "PERCENTAGE"
  const isFixed = type === "FIXED_AMOUNT"
  const isFreeShipping = type === "FREE_SHIPPING"

  const isValueValid = isFreeShipping
    ? true
    : isPercentage
    ? parsedValue >= 1 && parsedValue <= 100
    : parsedValue > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const normalizedCode = code.trim().toUpperCase()
    if (!normalizedCode || normalizedCode.length < 3) {
      setErrorMsg("Coupon code must be at least 3 characters long.")
      return
    }

    if (!isValueValid) {
      setErrorMsg(
        isPercentage
          ? "Percentage discount must be between 1% and 100%."
          : "Fixed discount amount must be greater than 0."
      )
      return
    }

    if (startsAt && expiresAt && new Date(expiresAt) <= new Date(startsAt)) {
      setErrorMsg("Expiration date must be strictly after start date.")
      return
    }

    const payload: UpdateCouponPayload = {
      code: normalizedCode,
      type,
      value: isFreeShipping ? 0 : parsedValue,
      minimumOrderAmount: minimumOrderAmount ? parseFloat(minimumOrderAmount) : null,
      maximumDiscountAmount:
        isPercentage && maximumDiscountAmount ? parseFloat(maximumDiscountAmount) : null,
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
      usageLimitPerUser: usageLimitPerUser ? parseInt(usageLimitPerUser, 10) : null,
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      status,
    }

    try {
      await updateCouponMutation.mutateAsync({ id: coupon.id, payload })
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update coupon parameters."
      setErrorMsg(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base">
                  Update Coupon &quot;{coupon.code}&quot;
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Modify discount parameters, maximum caps, limits, or activation status.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {errorMsg && (
            <div className="my-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4 py-4 text-xs">
            {/* 1. Code & Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Coupon Code</label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="font-mono font-bold text-xs uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Discount Type</label>
                <select
                  value={type}
                  onChange={(e) => {
                    const newType = e.target.value as CouponType
                    setType(newType)
                    if (newType === "FREE_SHIPPING") setValue("0")
                  }}
                  className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                  <option value="FREE_SHIPPING">Free Shipping ($0)</option>
                </select>
              </div>
            </div>

            {/* 2. Value & Max Cap */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">
                  {isPercentage
                    ? "Discount Percentage (%)"
                    : isFixed
                    ? "Discount Amount ($ USD)"
                    : "Shipping Benefit"}
                </label>
                <Input
                  type="number"
                  step={isPercentage ? "1" : "0.01"}
                  min={isPercentage ? "1" : "0"}
                  max={isPercentage ? "100" : undefined}
                  value={isFreeShipping ? "0" : value}
                  onChange={(e) => setValue(e.target.value)}
                  disabled={isFreeShipping}
                  className="font-mono text-xs"
                  required
                />
              </div>

              {isPercentage && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">
                    Maximum Discount Cap ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={maximumDiscountAmount}
                    onChange={(e) => setMaximumDiscountAmount(e.target.value)}
                    placeholder="e.g. 50.00"
                    className="font-mono text-xs"
                  />
                </div>
              )}
            </div>

            {/* 3. Minimum Order & Limits */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Min Subtotal ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={minimumOrderAmount}
                  onChange={(e) => setMinimumOrderAmount(e.target.value)}
                  placeholder="e.g. 30.00"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Global Limit</label>
                <Input
                  type="number"
                  min="1"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="e.g. 500"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Per-User Limit</label>
                <Input
                  type="number"
                  min="1"
                  value={usageLimitPerUser}
                  onChange={(e) => setUsageLimitPerUser(e.target.value)}
                  placeholder="e.g. 1"
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {/* 4. Dates & Status */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Starts At</label>
                <Input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Expires At</label>
                <Input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CouponStatus)}
                  className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateCouponMutation.isPending || !code.trim()}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              {updateCouponMutation.isPending ? (
                <>Updating...</>
              ) : (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
