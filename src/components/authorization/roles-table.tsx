/**
 * @file roles-table.tsx
 * @description Interactive data table for RBAC System Roles.
 * Displays role names, descriptions, permission counts, and lifecycle actions.
 */

"use client"

import * as React from "react"
import { Shield, Key, Edit, Trash2, Sliders, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/common/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { RoleBadge } from "./role-badge"
import { cn } from "@/lib/utils"
import type { RoleItem } from "@/types/authorization"

export interface RolesTableProps {
  roles: RoleItem[]
  isLoading?: boolean
  onManagePermissions: (role: RoleItem) => void
  onEditDetails: (role: RoleItem) => void
  onDeleteRole: (role: RoleItem) => void
  isDeletingId?: string | null
  onCreateRole?: () => void
}

export function RolesTable({
  roles,
  isLoading,
  onManagePermissions,
  onEditDetails,
  onDeleteRole,
  isDeletingId,
  onCreateRole,
}: RolesTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (roles.length === 0) {
    return (
      <EmptyState
        title="No RBAC Roles Defined"
        description="Create custom security roles and grant granular capabilities."
        actionLabel={onCreateRole ? "Create System Role" : undefined}
        onAction={onCreateRole}
      />
    )
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/40">
              <TableHead className="font-bold">ROLE NAME</TableHead>
              <TableHead className="font-bold">DESCRIPTION</TableHead>
              <TableHead className="font-bold text-center">PERMISSIONS</TableHead>
              <TableHead className="font-bold text-right w-[240px]">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {roles.map((role) => {
              const isSuperAdmin = role.name.toUpperCase() === "SUPER_ADMIN"
              const permCount = role.permissions?.length ?? 0
              const isDeleting = isDeletingId === role.id

              return (
                <TableRow key={role.id} className="hover:bg-muted/40 transition-colors">
                  {/* Role Name */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <RoleBadge role={role.name} />
                      {isSuperAdmin && (
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1 py-0 text-muted-foreground border-border/60"
                        >
                          <Lock className="mr-0.5 size-2.5 inline" /> System Protected
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Description */}
                  <TableCell className="text-muted-foreground max-w-md">
                    {role.description || "No description provided."}
                  </TableCell>

                  {/* Permissions Count */}
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className="font-mono text-[11px] bg-muted/60"
                    >
                      {isSuperAdmin ? "ALL (Full Access)" : `${permCount} Permissions`}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onManagePermissions(role)}
                        className="h-7 px-2 text-[11px] gap-1 border-primary/30 text-primary hover:bg-primary/5"
                      >
                        <Sliders className="size-3" />
                        <span>Permissions</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditDetails(role)}
                        disabled={isSuperAdmin}
                        className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="size-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteRole(role)}
                        disabled={isSuperAdmin || isDeleting}
                        className="h-7 px-2 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
