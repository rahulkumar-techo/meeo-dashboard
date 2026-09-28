/**
 * @file delete-variant-dialog.tsx
 * @description Danger confirmation modal for deleting a SKU variant from the product catalog.
 */

"use client"

import * as React from "react"
import Image from "next/image"
import { AlertTriangle, Loader2, Trash2, ImageIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

  const firstImage = variant.images?.[0]?.thumbnailUrl || variant.images?.[0]?.url
  const stock = variant.inventory?.quantity ?? variant.inventory?.availableQuantity ?? 0

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
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Delete Product Variant</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Review variant card details before confirming deletion.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5 py-2 text-xs">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-2.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Delete Preview Card */}
          <div className="p-3 rounded-xl border border-rose-200/60 bg-rose-50/20 dark:border-rose-900/40 dark:bg-rose-950/10 space-y-2.5">
            <div className="flex items-start gap-3">
              <div className="relative size-14 shrink-0 rounded-lg overflow-hidden border border-border/80 bg-background">
                {firstImage ? (
                  <Image
                    src={firstImage}
                    alt={variant.sku}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground/40 bg-muted/30">
                    <ImageIcon className="size-5" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono font-bold text-xs text-foreground truncate">
                    {variant.sku}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono uppercase shrink-0">
                    {variant.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="font-bold text-foreground">₹{Number(variant.price).toFixed(2)}</span>
                  {variant.compareAtPrice && Number(variant.compareAtPrice) > Number(variant.price) && (
                    <span className="text-[11px] text-muted-foreground line-through">
                      ₹{Number(variant.compareAtPrice).toFixed(2)}
                    </span>
                  )}
                  <span className="text-[10.5px] text-muted-foreground font-sans">• {stock} units in stock</span>
                </div>

                {variant.attributeValues && variant.attributeValues.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {variant.attributeValues.map((av: any, idx: number) => {
                      const name = av.attributeValue?.attribute?.name || av.attribute?.name
                      const val = av.attributeValue?.value || av.value || ""
                      return (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded bg-background border text-[10px] text-muted-foreground"
                        >
                          {name ? `${name}: ` : ""}{val}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            Are you sure you want to permanently delete SKU <strong className="font-mono text-foreground">{variant.sku}</strong>? This will remove all associated barcode links and archive stock history.
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
