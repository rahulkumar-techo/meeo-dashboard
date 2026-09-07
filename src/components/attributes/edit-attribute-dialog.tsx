/**
 * @file edit-attribute-dialog.tsx
 * @description Modal for editing an attribute name and/or appending new option values.
 */

"use client"

import * as React from "react"
import { Edit2, Plus, X, Loader2, Sparkles, AlertCircle, Layers, Tag } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useUpdateAttributeMutation } from "@/hooks/use-attribute-query"
import type { Attribute, UpdateAttributePayload } from "@/types/attribute"

export interface EditAttributeDialogProps {
  attribute: Attribute | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditAttributeDialog({
  attribute,
  open,
  onOpenChange,
  onSuccess,
}: EditAttributeDialogProps) {
  const [name, setName] = React.useState("")
  const [tagInput, setTagInput] = React.useState("")
  const [newValues, setNewValues] = React.useState<string[]>([])
  const [error, setError] = React.useState<string | null>(null)

  const updateMutation = useUpdateAttributeMutation()

  React.useEffect(() => {
    if (attribute && open) {
      setName(attribute.name || "")
      setTagInput("")
      setNewValues([])
      setError(null)
    }
  }, [attribute, open])

  if (!attribute) return null

  const existingValues = attribute.values?.map((v) => v.value) ?? []

  const handleAddNewTag = () => {
    const raw = tagInput.trim()
    if (!raw) return

    const split = raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(
        (s) =>
          s.length > 0 &&
          !existingValues.includes(s) &&
          !newValues.includes(s)
      )

    if (split.length > 0) {
      setNewValues((prev) => [...prev, ...split])
      setTagInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      handleAddNewTag()
    }
  }

  const handleRemoveNewTag = (valToRemove: string) => {
    setNewValues((prev) => prev.filter((v) => v !== valToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Attribute name cannot be empty.")
      return
    }

    const payload: UpdateAttributePayload = {}
    if (trimmedName !== attribute.name) {
      payload.name = trimmedName
    }
    if (newValues.length > 0) {
      payload.values = newValues
    }

    if (!payload.name && !payload.values) {
      onOpenChange(false)
      return
    }

    updateMutation.mutate(
      { id: attribute.id, payload },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess?.()
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ||
            err.message ||
            "Failed to update attribute."
          setError(msg)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Edit2 className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Edit Master Attribute</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Update the attribute name or append new values.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-2.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Name input */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Attribute Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                placeholder="Attribute name"
                className="h-8.5 text-xs"
                required
              />
            </div>

            {/* Existing Values Display */}
            {existingValues.length > 0 && (
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                  Current Values ({existingValues.length})
                </label>
                <div className="flex flex-wrap gap-1 p-2.5 rounded-lg border border-border/60 bg-muted/20">
                  {existingValues.map((v, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-[11px] font-normal px-2 py-0.5 bg-muted/80 text-foreground"
                    >
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Append New Values */}
            <div className="space-y-2 p-3.5 rounded-xl border border-border/70 bg-muted/20">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                  <Plus className="size-3.5 text-indigo-600" />
                  <span>Append New Values</span>
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Press Enter or comma to add
                </span>
              </div>

              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. Midnight Purple, Rose Gold"
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddNewTag}
                  className="h-8 text-xs gap-1 shrink-0"
                >
                  <Plus className="size-3" />
                  <span>Add</span>
                </Button>
              </div>

              {newValues.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {newValues.map((val) => (
                    <Badge
                      key={val}
                      variant="secondary"
                      className="text-xs font-medium pl-2.5 pr-1.5 py-0.5 gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300"
                    >
                      <span>+ {val}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewTag(val)}
                        className="rounded hover:bg-indigo-200/50 p-0.5"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col-reverse sm:flex-row pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
              className="text-xs h-8.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateMutation.isPending}
              className="text-xs h-8.5 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
