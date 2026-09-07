/**
 * @file delete-brand-dialog.tsx
 * @description Confirmation modal for deleting a brand entity.
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
import { useDeleteBrandMutation } from "@/hooks/use-brand-query"
import type { Brand } from "@/types/brand"

export interface DeleteBrandDialogProps {
  brand: Brand | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteBrandDialog({
  brand,
  open,
  onOpenChange,
  onSuccess,
}: DeleteBrandDialogProps) {
  const [error, setError] = React.useState<string | null>(null)
  const deleteMutation = useDeleteBrandMutation()

  if (!brand) return null

  const handleDelete = () => {
    setError(null)
    deleteMutation.mutate(brand.id, {
      onSuccess: () => {
        onOpenChange(false)
        onSuccess?.()
      },
      onError: (err: any) => {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to delete brand. Check if products are linked."
        setError(msg)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Delete Brand</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <p className="text-muted-foreground leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <strong className="text-foreground font-semibold">&ldquo;{brand.name}&rdquo;</strong>{" "}
            (<code className="font-mono text-[11px] text-foreground">/brands/{brand.slug}</code>)?
          </p>

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
                <span>Delete Brand</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
