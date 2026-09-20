/**
 * @file edit-promotion-dialog.tsx
 * @description Spacious, uncollapsed dialog modal for updating an existing Promotion & Campaign Rule.
 */

"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUpdatePromotionMutation } from "@/hooks/use-promotion-query"
import type { PromotionListItem } from "@/types/promotion"

interface EditPromotionDialogProps {
  promotion: PromotionListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditPromotionDialog({
  promotion,
  open,
  onOpenChange,
  onSuccess,
}: EditPromotionDialogProps) {
  const [name, setName] = React.useState("")
  const [priority, setPriority] = React.useState(10)
  const [totalUsageLimit, setTotalUsageLimit] = React.useState("")

  const updateMutation = useUpdatePromotionMutation()

  React.useEffect(() => {
    if (promotion) {
      setName(promotion.name)
      setPriority(promotion.priority ?? 10)
      setTotalUsageLimit(
        promotion.totalUsageLimit ? String(promotion.totalUsageLimit) : ""
      )
    }
  }, [promotion])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promotion) return

    await updateMutation.mutateAsync({
      id: promotion.id,
      payload: {
        name,
        priority: Number(priority) || 10,
        totalUsageLimit: totalUsageLimit ? Number(totalUsageLimit) : undefined,
      },
    })
    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] p-6 sm:p-7">
        <DialogHeader className="space-y-1.5 pb-2">
          <DialogTitle className="text-lg font-bold tracking-tight">Edit Promotion</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Update campaign display name, priority order, or total redemption capacity.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground">
              Campaign Name *
            </label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9.5 text-xs sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Priority Level
              </label>
              <Input
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="h-9.5 text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Total Usage Limit
              </label>
              <Input
                type="number"
                value={totalUsageLimit}
                onChange={(e) => setTotalUsageLimit(e.target.value)}
                placeholder="2000"
                className="h-9.5 text-xs sm:text-sm"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateMutation.isPending}
              className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
