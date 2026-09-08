/**
 * @file create-edit-role-dialog.tsx
 * @description Dialog for creating a new system role or updating existing role metadata.
 */

"use client"

import * as React from "react"
import { Shield, Plus, Edit } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import type { RoleItem } from "@/types/authorization"

export interface CreateEditRoleDialogProps {
  role?: RoleItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; description: string }) => Promise<void>
  isSubmitting?: boolean
}

export function CreateEditRoleDialog({
  role,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreateEditRoleDialogProps) {
  const isEditing = Boolean(role)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setName(role?.name || "")
      setDescription(role?.description || "")
    }
  }, [role, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    await onSubmit({
      name: name.trim().toUpperCase().replace(/\s+/g, "_"),
      description: description.trim(),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                {isEditing ? <Edit className="size-4" /> : <Plus className="size-4" />}
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  {isEditing ? `Edit Role: ${role?.name}` : "Create New System Role"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {isEditing
                    ? "Update role display label and functional scope description."
                    : "Define an immutable role identifier for permission binding."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 py-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">
                Role Name / Constant <span className="text-rose-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. SUPPORT_LEAD, INVENTORY_AUDITOR"
                className="h-8.5 font-mono uppercase text-xs"
                required
              />
              <p className="text-[10.5px] text-muted-foreground">
                Standardized uppercase identifier with underscores.
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the operational responsibilities and permission scope for this role..."
                className="text-xs resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !name.trim()}
              className="gap-1 font-medium"
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update Role"
                : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
