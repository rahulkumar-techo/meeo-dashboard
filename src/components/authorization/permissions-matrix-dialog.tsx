/**
 * @file permissions-matrix-dialog.tsx
 * @description Dialog for configuring granular permission matrix across functional domains for a role.
 * Executes atomic permission swaps and triggers real-time session cache invalidation.
 */

"use client"

import * as React from "react"
import {
  Sliders,
  Check,
  Shield,
  Search,
  Lock,
  CheckSquare,
  Square,
} from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { usePermissionsQuery } from "@/hooks/use-authorization-query"
import { cn } from "@/lib/utils"
import type { RoleItem, PermissionItem } from "@/types/authorization"

export interface PermissionsMatrixDialogProps {
  role: RoleItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (roleId: string, permissionIds: string[]) => Promise<void>
  isSaving?: boolean
}

// Domain categorizer helper
function getPermissionDomain(name: string): string {
  const prefix = name.split(":")[0]
  switch (prefix) {
    case "product":
      return "Products & Catalog"
    case "category":
    case "brand":
      return "Categories & Brands"
    case "attribute":
      return "Attributes & Variants"
    case "order":
      return "Orders & Fulfillment"
    case "inventory":
      return "Inventory & Stock"
    case "payment":
      return "Finance & Payments"
    case "user":
      return "Customers & Users"
    case "role":
      return "RBAC Administration"
    case "coupon":
      return "Marketing & Coupons"
    case "review":
      return "Reviews & Moderation"
    case "dashboard":
      return "Executive Analytics"
    case "audit":
    case "system":
      return "System & Compliance"
    default:
      return "General Platform"
  }
}

export function PermissionsMatrixDialog({
  role,
  open,
  onOpenChange,
  onSave,
  isSaving,
}: PermissionsMatrixDialogProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [searchFilter, setSearchFilter] = React.useState("")

  const { data: allPermissions, isLoading } = usePermissionsQuery()

  const isSuperAdmin = role?.name.toUpperCase() === "SUPER_ADMIN"

  // Initialize selected permissions when role changes
  React.useEffect(() => {
    if (role && open) {
      const currentIds = new Set<string>()
      if (role.permissions) {
        role.permissions.forEach((p: any) => {
          if (p.permission?.id) {
            currentIds.add(p.permission.id)
          } else if (p.id) {
            currentIds.add(p.id)
          }
        })
      }
      setSelectedIds(currentIds)
      setSearchFilter("")
    }
  }, [role, open])

  // Group permissions by domain
  const permissionsByDomain = React.useMemo(() => {
    const list = allPermissions ?? []
    const groups: Record<string, PermissionItem[]> = {}

    list.forEach((p) => {
      const domain = p.domain || getPermissionDomain(p.name)
      if (!groups[domain]) groups[domain] = []

      if (
        !searchFilter ||
        p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        domain.toLowerCase().includes(searchFilter.toLowerCase())
      ) {
        groups[domain].push(p)
      }
    })

    return groups
  }, [allPermissions, searchFilter])

  const togglePermission = (id: string) => {
    if (isSuperAdmin) return
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  const toggleDomain = (domainPermissions: PermissionItem[]) => {
    if (isSuperAdmin) return
    const allSelected = domainPermissions.every((p) => selectedIds.has(p.id))
    const next = new Set(selectedIds)

    if (allSelected) {
      domainPermissions.forEach((p) => next.delete(p.id))
    } else {
      domainPermissions.forEach((p) => next.add(p.id))
    }
    setSelectedIds(next)
  }

  const handleSave = async () => {
    if (!role) return
    await onSave(role.id, Array.from(selectedIds))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b border-border/80">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
              <Sliders className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>Manage Permissions: {role?.name}</span>
                {isSuperAdmin && (
                  <Badge variant="outline" className="text-[10px] text-purple-600">
                    <Lock className="mr-1 size-2.5 inline" /> Full Bypass
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure fine-grained capabilities granted to operators assigned this role.
              </DialogDescription>
            </div>
          </div>

          {/* Search bar inside header */}
          <div className="pt-2">
            <Input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter permissions by keyword (e.g. order:update, refund, product)..."
              className="h-8 text-xs bg-muted/40"
            />
          </div>
        </DialogHeader>

        {/* Scrollable permissions container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : Object.keys(permissionsByDomain).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No permissions match your search filter.
            </div>
          ) : (
            Object.entries(permissionsByDomain).map(([domain, perms]) => {
              if (perms.length === 0) return null
              const allDomainSelected = perms.every((p) => selectedIds.has(p.id))
              const someDomainSelected = perms.some((p) => selectedIds.has(p.id))

              return (
                <div
                  key={domain}
                  className="rounded-lg border border-border/80 bg-card overflow-hidden"
                >
                  {/* Domain Header */}
                  <div className="flex items-center justify-between bg-muted/50 px-3.5 py-2 border-b border-border/60">
                    <span className="font-bold text-foreground text-[11px] uppercase tracking-wider">
                      {domain} ({perms.length})
                    </span>
                    {!isSuperAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDomain(perms)}
                        className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        {allDomainSelected ? "Deselect All" : "Select All"}
                      </Button>
                    )}
                  </div>

                  {/* Permissions Checkbox Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
                    {perms.map((perm) => {
                      const isChecked = isSuperAdmin || selectedIds.has(perm.id)

                      return (
                        <div
                          key={perm.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => togglePermission(perm.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              togglePermission(perm.id)
                            }
                          }}
                          className={cn(
                            "flex items-start gap-2.5 rounded-md p-2 border transition-colors cursor-pointer text-left",
                            isChecked
                              ? "border-primary/40 bg-primary/5"
                              : "border-border/60 hover:bg-muted/30"
                          )}
                        >
                          <div
                            className={cn(
                              "mt-0.5 size-4 rounded flex items-center justify-center border shrink-0 transition-colors",
                              isChecked
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/40"
                            )}
                          >
                            {isChecked && <Check className="size-3" />}
                          </div>

                          <div className="space-y-0.5 min-w-0">
                            <p className="font-mono font-semibold text-foreground text-[11px] truncate">
                              {perm.name}
                            </p>
                            {perm.description && (
                              <p className="text-[10.5px] text-muted-foreground leading-snug line-clamp-2">
                                {perm.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-border/80 bg-muted/20 gap-2 sm:gap-0">
          <div className="flex-1 text-left text-[11px] text-muted-foreground font-mono">
            {isSuperAdmin
              ? "SUPER_ADMIN has universal access to all permissions."
              : `${selectedIds.size} permissions selected`}
          </div>

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
            disabled={isSaving || isSuperAdmin}
            onClick={handleSave}
            className="gap-1 font-medium"
          >
            {isSaving ? "Saving..." : "Save Permission Matrix"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
