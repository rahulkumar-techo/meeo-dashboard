/**
 * @file assign-user-roles-dialog.tsx
 * @description Dialog for assigning / replacing roles for an operator.
 * Executes atomic role assignment and automatically flushes active user JWT session context.
 */

"use client"

import * as React from "react"
import { Key, User, Check, Shield } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRolesQuery } from "@/hooks/use-authorization-query"
import { RoleBadge } from "./role-badge"
import { cn } from "@/lib/utils"
import type { AdminCustomer } from "@/types/customer"

export interface AssignUserRolesDialogProps {
  user: AdminCustomer | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (userId: string, roleIds: string[]) => Promise<void>
  isSaving?: boolean
}

export function AssignUserRolesDialog({
  user,
  open,
  onOpenChange,
  onSave,
  isSaving,
}: AssignUserRolesDialogProps) {
  const [selectedRoleIds, setSelectedRoleIds] = React.useState<Set<string>>(
    new Set()
  )

  const { data: roles } = useRolesQuery()

  const userName = user
    ? user.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : user.email
    : "Operator"

  React.useEffect(() => {
    if (user && open && roles) {
      const userRoleNames = new Set(
        Array.isArray(user.roles) ? user.roles : []
      )
      const initialIds = new Set<string>()

      roles.forEach((r) => {
        if (userRoleNames.has(r.name)) {
          initialIds.add(r.id)
        }
      })

      setSelectedRoleIds(initialIds)
    }
  }, [user, open, roles])

  const toggleRole = (roleId: string) => {
    const next = new Set(selectedRoleIds)
    if (next.has(roleId)) {
      next.delete(roleId)
    } else {
      next.add(roleId)
    }
    setSelectedRoleIds(next)
  }

  const handleSave = async () => {
    if (!user) return
    await onSave(user.id, Array.from(selectedRoleIds))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
              <Key className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Assign Security Roles
              </DialogTitle>
              <DialogDescription className="text-xs">
                Bind role profiles to{" "}
                <span className="font-semibold text-foreground">
                  {userName}
                </span>
                .
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-3 text-xs">
          <p className="text-muted-foreground text-[11px]">
            Select the RBAC roles to grant this operator. All active sessions will be invalidated immediately.
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {roles?.map((role) => {
              const isSelected = selectedRoleIds.has(role.id)

              return (
                <div
                  key={role.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleRole(role.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      toggleRole(role.id)
                    }
                  }}
                  className={cn(
                    "flex items-start gap-2.5 rounded-lg border p-2.5 transition-colors cursor-pointer text-left",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/30"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 size-4 rounded flex items-center justify-center border shrink-0 transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    )}
                  >
                    {isSelected && <Check className="size-3" />}
                  </div>

                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <RoleBadge role={role.name} />
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {role.permissions?.length ?? 0} perms
                      </span>
                    </div>
                    {role.description && (
                      <p className="text-[10.5px] text-muted-foreground line-clamp-2 mt-1">
                        {role.description}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSaving}
            onClick={handleSave}
            className="gap-1 font-medium"
          >
            {isSaving ? "Updating Roles..." : "Update Role Assignments"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
