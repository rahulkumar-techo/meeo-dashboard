/**
 * @file delete-attribute-dialog.tsx
 * @description Confirmation modal for deleting a master attribute.
 */

"use client"

import * as React from "react"
import { Trash2, Loader2, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteAttributeMutation } from "@/hooks/use-attribute-query"
import type { Attribute } from "@/types/attribute"

export interface DeleteAttributeDialogProps {
  attribute: Attribute | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteAttributeDialog({
  attribute,
  open,
  onOpenChange,
  onSuccess,
}: DeleteAttributeDialogProps) {
  const [error, setError] = React.useState<string | null>(null)
  const deleteMutation = useDeleteAttributeMutation()

  React.useEffect(() => {
    if (open) setError(null)
  }, [open])

  if (!attribute) return null

  const handleDelete = () => {
    setError(null)
    deleteMutation.mutate(attribute.id, {
      onSuccess: () => {
        onOpenChange(false)
        onSuccess?.()
      },
      onError: (err: any) => {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to delete attribute. It may still be linked to product variants."
        setError(msg)
      },
    })
  }

  const valuesCount = attribute.values?.length ?? attribute._count?.values ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
              <Trash2 className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-rose-600 dark:text-rose-400">
                Delete Master Attribute
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-3 text-xs">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-2.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2.5 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-foreground">{attribute.name}</span>?
              {valuesCount > 0 && (
                <span className="block mt-1 text-[11px] opacity-90">
                  This will also remove {valuesCount} associated {valuesCount === 1 ? "value" : "values"}.
                </span>
              )}
            </div>
          </div>
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
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="text-xs h-8.5 gap-1.5"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" />
                <span>Delete Attribute</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
