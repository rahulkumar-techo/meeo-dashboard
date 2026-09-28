/**
 * @file delete-product-dialog.tsx
 * @description Confirmation modal for deleting or archiving a product entity.
 */

"use client"

import * as React from "react"
import Image from "next/image"
import { Trash2, AlertTriangle, Loader2, ImageIcon } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { useDeleteProductMutation } from "@/hooks/use-product-query"
import type { Product } from "@/types/product"

export interface DeleteProductDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteProductDialog({
  product,
  open,
  onOpenChange,
  onSuccess,
}: DeleteProductDialogProps) {
  const [isPermanent, setIsPermanent] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const deleteMutation = useDeleteProductMutation()

  if (!product) return null

  const firstImage = product.images?.[0]?.thumbnailUrl || product.images?.[0]?.url

  const handleDelete = () => {
    setError(null)
    deleteMutation.mutate(
      { id: product.id, permanent: isPermanent },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess?.()
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ||
            err.message ||
            "Failed to delete product. Please try again."
          setError(msg)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Delete Product</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Review product card details before confirming deletion.
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

          {/* Product Preview Card */}
          <div className="p-3 rounded-xl border border-rose-200/60 bg-rose-50/20 dark:border-rose-900/40 dark:bg-rose-950/10 space-y-2">
            <div className="flex items-start gap-3">
              <div className="relative size-14 shrink-0 rounded-lg overflow-hidden border border-border/80 bg-background">
                {firstImage ? (
                  <Image
                    src={firstImage}
                    alt={product.name}
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
                  <span className="font-semibold text-xs text-foreground truncate">
                    {product.name}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono uppercase shrink-0">
                    {product.status}
                  </Badge>
                </div>

                <p className="font-mono text-[11px] text-muted-foreground truncate">
                  /products/{product.slug}
                </p>

                {product.brand && (
                  <p className="text-[10.5px] text-muted-foreground">
                    Brand: <strong className="text-foreground">{product.brand.name}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            Are you sure you want to delete <strong className="text-foreground font-semibold">&ldquo;{product.name}&rdquo;</strong>?
          </p>

          <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground block">Permanent Hard Delete</span>
                <span className="text-[11px] text-muted-foreground">
                  Permanently purge record and gallery images from database and storage
                </span>
              </div>
              <Switch checked={isPermanent} onCheckedChange={setIsPermanent} />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 gap-2 flex-col-reverse sm:flex-row">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
            className="text-xs h-9"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="text-xs h-9 gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" />
                <span>{isPermanent ? "Permanently Delete" : "Delete Product"}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
