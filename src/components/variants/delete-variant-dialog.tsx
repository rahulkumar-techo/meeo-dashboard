/**
 * @file delete-variant-dialog.tsx
 * @description Danger confirmation modal for deleting a SKU variant from the product catalog.
 */

"use client"

import * as React from "react"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteVariantMutation } from "@/hooks/use-variant-query"
import type { ProductVariant } from "@/types/variant"

export interface DeleteVariantDialogProps {
  variant: ProductVariant | null
  productId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteVariantDialog({
  variant,
  productId,
  open,
  onOpenChange,
  onSuccess,
}: DeleteVariantDialogProps) {
  const [error, setError] = React.useState<string | null>(null)
  const deleteMutation = useDeleteVariantMutation(productId)

  React.useEffect(() => {
    if (open) setError(null)
  }, [open])

  if (!variant) return null

  const handleDelete = () => {
    setError(null)
    deleteMutation.mutate(variant.id, {
      onSuccess: () => {
        onOpenChange(false)
        onSuccess?.()
      },
      onError: (err: any) => {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to delete product variant."
        setError(msg)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Delete Product Variant</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Remove SKU <span className="font-mono font-semibold text-foreground">{variant.sku}</span> from catalog.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-2.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}
          <p className="text-muted-foreground leading-relaxed">
            Are you sure you want to delete this variant? This action will remove the SKU code, barcode associations, and archive its inventory tracking records.
          </p>
        </div>

        <DialogFooter className="gap-2 flex-col-reverse sm:flex-row pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
            className="text-xs h-8.5"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="text-xs h-8.5 gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" />
                <span>Delete Variant</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
