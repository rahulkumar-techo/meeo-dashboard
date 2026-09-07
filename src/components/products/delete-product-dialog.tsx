/**
 * @file delete-product-dialog.tsx
 * @description Confirmation modal for deleting or archiving a product entity.
 */

"use client"

import * as React from "react"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Delete Product</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Choose between soft archival or permanent purge.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <p className="text-muted-foreground leading-relaxed">
            Are you sure you want to delete{" "}
            <strong className="text-foreground font-semibold">&ldquo;{product.name}&rdquo;</strong>{" "}
            (<code className="font-mono text-[11px] text-foreground">/products/{product.slug}</code>)?
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

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-2.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}
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
