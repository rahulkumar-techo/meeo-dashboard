/**
 * @file create-attribute-dialog.tsx
 * @description Modal for creating a new master attribute with optional initial value tags.
 */

"use client"

import * as React from "react"
import { Tag, Plus, X, Loader2, Sparkles, AlertCircle } from "lucide-react"
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
import { useCreateAttributeMutation } from "@/hooks/use-attribute-query"
import type { CreateAttributePayload } from "@/types/attribute"

export interface CreateAttributeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateAttributeDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAttributeDialogProps) {
  const [name, setName] = React.useState("")
  const [tagInput, setTagInput] = React.useState("")
  const [values, setValues] = React.useState<string[]>([])
  const [error, setError] = React.useState<string | null>(null)

  const createMutation = useCreateAttributeMutation()

  React.useEffect(() => {
    if (open) {
      setName("")
      setTagInput("")
      setValues([])
      setError(null)
    }
  }, [open])

  const handleAddTag = () => {
    const raw = tagInput.trim()
    if (!raw) return

    // Support comma-separated strings
    const split = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !values.includes(s))

    if (split.length > 0) {
      setValues((prev) => [...prev, ...split])
      setTagInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleRemoveTag = (valToRemove: string) => {
    setValues((prev) => prev.filter((v) => v !== valToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Attribute name is required.")
      return
    }

    const payload: CreateAttributePayload = {
      name: name.trim(),
      values: values.length > 0 ? values : undefined,
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false)
        onSuccess?.()
      },
      onError: (err: any) => {
        const validationMsg = err.response?.data?.errors?.[0]?.message
        const msg =
          validationMsg ||
          err.response?.data?.message ||
          err.message ||
          "Failed to create master attribute."
        setError(msg)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Tag className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Create Master Attribute</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Define reusable variant attributes like Color, Size, Storage, or Material.
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

            {/* Attribute Name */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Attribute Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Color, Size, Storage Capacity"
                className="h-8.5 text-xs"
                required
              />
            </div>

            {/* Initial Values Tag Input */}
            <div className="space-y-2 p-3.5 rounded-xl border border-border/70 bg-muted/20">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-foreground text-xs">
                  Initial Attribute Values (Optional)
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
                  placeholder="e.g. Midnight Black, Starlight Silver"
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddTag}
                  className="h-8 text-xs gap-1 shrink-0"
                >
                  <Plus className="size-3" />
                  <span>Add</span>
                </Button>
              </div>

              {/* Tag Badges */}
              {values.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {values.map((val) => (
                    <Badge
                      key={val}
                      variant="secondary"
                      className="text-xs font-medium pl-2.5 pr-1.5 py-0.5 gap-1.5 bg-background border border-border/60 text-foreground"
                    >
                      <span>{val}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(val)}
                        className="rounded hover:bg-muted p-0.5 text-muted-foreground hover:text-foreground"
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
              disabled={createMutation.isPending}
              className="text-xs h-8.5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              className="text-xs h-8.5 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  <span>Create Attribute</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
