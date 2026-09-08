/**
 * @file page.tsx
 * @description Admin Operators, IAM RBAC Roles & Fine-Grained Authorization Console.
 * Connects directly to backend RBAC endpoints (/api/v1/admin/roles, /permissions, /users/:userId/roles) with zero mock data.
 */

"use client"

import * as React from "react"
import {
  Plus,
  RefreshCw,
  Shield,
  Key,
  Laptop,
  UserCheck,
  Search,
  Filter,
  Users,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  PageHeader,
  StatusBadge,
  DataTableToolbar,
  DataTablePagination,
  EmptyState,
  ConfirmDialog,
} from "@/components/common"
import {
  RoleBadge,
  RBACMetrics,
  RolesTable,
  PermissionsMatrixDialog,
  CreateEditRoleDialog,
  AssignUserRolesDialog,
  UserSessionsModal,
  RBACGuideCard,
} from "@/components/authorization"
import {
  useRolesQuery,
  usePermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useReplaceRolePermissionsMutation,
  useAssignUserRolesMutation,
} from "@/hooks/use-authorization-query"
import { useCustomersQuery } from "@/hooks/use-customer-query"
import type { RoleItem } from "@/types/authorization"
import type { AdminCustomer } from "@/types/customer"

export default function UsersRolesPage() {
  const [activeTab, setActiveTab] = React.useState<"operators" | "roles">(
    "operators"
  )

  // Filters state for Operators
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  // Modals state
  const [isCreateRoleOpen, setIsCreateRoleOpen] = React.useState(false)
  const [editingRole, setEditingRole] = React.useState<RoleItem | null>(null)
  const [matrixRole, setMatrixRole] = React.useState<RoleItem | null>(null)
  const [deletingRole, setDeletingRole] = React.useState<RoleItem | null>(null)
  const [assigningUser, setAssigningUser] = React.useState<AdminCustomer | null>(
    null
  )
  const [sessionsUser, setSessionsUser] = React.useState<AdminCustomer | null>(
    null
  )

  // Banner message state
  const [bannerMessage, setBannerMessage] = React.useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const showBanner = (type: "success" | "error", text: string) => {
    setBannerMessage({ type, text })
    setTimeout(() => {
      setBannerMessage((prev) => (prev?.text === text ? null : prev))
    }, 4000)
  }

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Queries
  const {
    data: roles,
    isLoading: isRolesLoading,
    refetch: refetchRoles,
  } = useRolesQuery()

  const { data: permissions } = usePermissionsQuery()

  const {
    data: customersData,
    isLoading: isUsersLoading,
    refetch: refetchUsers,
    isRefetching: isUsersRefetching,
  } = useCustomersQuery({
    search: debouncedSearch || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    page,
    limit: pageSize,
  })

  // Mutations
  const createRoleMutation = useCreateRoleMutation()
  const updateRoleMutation = useUpdateRoleMutation()
  const deleteRoleMutation = useDeleteRoleMutation()
  const replacePermissionsMutation = useReplaceRolePermissionsMutation()
  const assignRolesMutation = useAssignUserRolesMutation()

  const operators = customersData?.items ?? []
  const pagination = customersData?.pagination ?? {
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 1,
  }

  const roleList = roles ?? []
  const totalPermissions = permissions?.length ?? 0

  // Handlers
  const handleRefreshAll = () => {
    refetchRoles()
    refetchUsers()
    showBanner("success", "Authorization context and operator roster refreshed")
  }

  const handleCreateOrUpdateRole = async (data: {
    name: string
    description: string
  }) => {
    try {
      if (editingRole) {
        await updateRoleMutation.mutateAsync({
          roleId: editingRole.id,
          payload: data,
        })
        showBanner("success", `Role ${data.name} updated successfully`)
      } else {
        await createRoleMutation.mutateAsync(data)
        showBanner("success", `Role ${data.name} created successfully`)
      }
      setIsCreateRoleOpen(false)
      setEditingRole(null)
      refetchRoles()
    } catch (err: any) {
      showBanner(
        "error",
        err?.response?.data?.message || err?.message || "Failed to save role"
      )
    }
  }

  const handleDeleteRole = async () => {
    if (!deletingRole) return
    try {
      await deleteRoleMutation.mutateAsync(deletingRole.id)
      showBanner(
        "success",
        `Role ${deletingRole.name} deleted successfully`
      )
      setDeletingRole(null)
      refetchRoles()
    } catch (err: any) {
      showBanner(
        "error",
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete role"
      )
    }
  }

  const handleSavePermissions = async (
    roleId: string,
    permissionIds: string[]
  ) => {
    try {
      await replacePermissionsMutation.mutateAsync({
        roleId,
        payload: { permissionIds },
      })
      showBanner("success", "Permissions matrix saved and sessions invalidated")
      refetchRoles()
    } catch (err: any) {
      showBanner(
        "error",
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save permissions"
      )
    }
  }

  const handleAssignRoles = async (userId: string, roleIds: string[]) => {
    try {
      await assignRolesMutation.mutateAsync({
        userId,
        payload: { roleIds },
      })
      showBanner("success", "User roles updated and session cache flushed")
      refetchUsers()
    } catch (err: any) {
      showBanner(
        "error",
        err?.response?.data?.message ||
          err?.message ||
          "Failed to assign user roles"
      )
    }
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setStatusFilter("ALL")
    setPage(1)
  }

  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Admin Users & Role-Based Access Control"
        badge="Zero Trust RBAC"
        badgeVariant="brand"
        description="Manage privileged operators, fine-grained permission policies, role assignments, and real-time session invalidation."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isUsersRefetching}
            className="h-8.5 gap-1.5 text-xs font-medium"
          >
            <RefreshCw
              className={`size-3.5 ${isUsersRefetching ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingRole(null)
              setIsCreateRoleOpen(true)
            }}
            className="h-8.5 gap-1.5 text-xs font-medium bg-primary text-primary-foreground shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Create Role</span>
          </Button>
        </div>
      </PageHeader>

      {/* Banner Feedback */}
      {bannerMessage && (
        <div
          className={`rounded-lg p-3 text-xs border ${
            bannerMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300"
          }`}
        >
          {bannerMessage.text}
        </div>
      )}

      {/* 2. Operational Guide / Runbook */}
      <RBACGuideCard />

      {/* 3. KPI Metrics */}
      <RBACMetrics
        rolesCount={roleList.length}
        permissionsCount={totalPermissions}
        operatorsCount={pagination.total}
        isLoading={isRolesLoading}
      />

      {/* 4. Tab Switcher (Operators vs Roles Matrix) */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "operators" | "roles")}
        className="w-full space-y-4"
      >
        <TabsList className="grid grid-cols-2 max-w-md h-auto p-1 bg-muted/70">
          <TabsTrigger value="operators" className="text-xs py-1.5 font-medium gap-1.5">
            <Users className="size-3.5" />
            <span>Operators & Users ({pagination.total})</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="text-xs py-1.5 font-medium gap-1.5">
            <Key className="size-3.5" />
            <span>RBAC Roles & Matrix ({roleList.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Operators & User Assignments */}
        <TabsContent value="operators" className="space-y-4 focus-visible:outline-hidden">
          <DataTableToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search operator by email or ID..."
            filters={
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="h-8.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="BLOCKED">BLOCKED</option>
                <option value="PENDING_VERIFICATION">PENDING VERIFICATION</option>
              </select>
            }
            activeFiltersCount={
              (statusFilter !== "ALL" ? 1 : 0) + (searchQuery ? 1 : 0)
            }
            onResetFilters={handleResetFilters}
          />

          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            {operators.length === 0 ? (
              <EmptyState
                title="No Operators or Users Found"
                description="No users matched your search criteria."
                actionLabel="Reset Filters"
                onAction={handleResetFilters}
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/40">
                      <TableHead className="font-bold">OPERATOR / USER</TableHead>
                      <TableHead className="font-bold">ASSIGNED ROLES</TableHead>
                      <TableHead className="font-bold">ACCOUNT STATUS</TableHead>
                      <TableHead className="font-bold">REGISTERED</TableHead>
                      <TableHead className="font-bold text-right w-[210px]">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs">
                    {operators.map((op) => {
                      const userRoles = Array.isArray(op.roles)
                        ? op.roles
                        : []

                      const displayName = op.firstName
                        ? `${op.firstName} ${op.lastName || ""}`.trim()
                        : op.email

                      return (
                        <TableRow
                          key={op.id}
                          className="hover:bg-muted/40 transition-colors"
                        >
                          {/* Operator Identity */}
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <Avatar className="size-7 border border-border">
                                <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
                                  {displayName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-foreground">
                                  {displayName}
                                </p>
                                <p className="text-[10.5px] text-muted-foreground font-mono">
                                  {op.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Assigned Roles */}
                          <TableCell>
                            {userRoles.length === 0 ? (
                              <span className="font-mono text-[11px] text-muted-foreground">
                                No roles assigned
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {userRoles.map((r, i) => (
                                  <RoleBadge key={i} role={r} />
                                ))}
                              </div>
                            )}
                          </TableCell>

                          {/* Account Status */}
                          <TableCell>
                            <StatusBadge status={op.status || "ACTIVE"} showDot />
                          </TableCell>

                          {/* Registered Date */}
                          <TableCell className="font-mono text-muted-foreground text-[11px]">
                            {op.createdAt ? new Date(op.createdAt).toLocaleDateString() : "-"}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAssigningUser(op)}
                                className="h-7 px-2 text-[11px] gap-1 border-primary/30 text-primary hover:bg-primary/5"
                              >
                                <Key className="size-3" />
                                <span>Roles</span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSessionsUser(op)}
                                className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                              >
                                <Laptop className="size-3" />
                                <span>Sessions</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            <DataTablePagination
              currentPage={pagination.page || page}
              totalPages={pagination.totalPages || 1}
              pageSize={pagination.limit || pageSize}
              totalItems={pagination.total || operators.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
            />
          </div>
        </TabsContent>

        {/* Tab 2: RBAC Roles & Permissions Matrix */}
        <TabsContent value="roles" className="space-y-4 focus-visible:outline-hidden">
          <RolesTable
            roles={roleList}
            isLoading={isRolesLoading}
            onManagePermissions={(role) => setMatrixRole(role)}
            onEditDetails={(role) => {
              setEditingRole(role)
              setIsCreateRoleOpen(true)
            }}
            onDeleteRole={(role) => setDeletingRole(role)}
            isDeletingId={deleteRoleMutation.isPending ? deletingRole?.id : null}
            onCreateRole={() => {
              setEditingRole(null)
              setIsCreateRoleOpen(true)
            }}
          />
        </TabsContent>
      </Tabs>

      {/* 5. Modals & Dialogs */}

      {/* Create / Edit Role Dialog */}
      <CreateEditRoleDialog
        role={editingRole}
        open={isCreateRoleOpen}
        onOpenChange={setIsCreateRoleOpen}
        onSubmit={handleCreateOrUpdateRole}
        isSubmitting={
          createRoleMutation.isPending || updateRoleMutation.isPending
        }
      />

      {/* Permissions Matrix Dialog */}
      <PermissionsMatrixDialog
        role={matrixRole}
        open={Boolean(matrixRole)}
        onOpenChange={(open) => {
          if (!open) setMatrixRole(null)
        }}
        onSave={handleSavePermissions}
        isSaving={replacePermissionsMutation.isPending}
      />

      {/* Assign User Roles Dialog */}
      <AssignUserRolesDialog
        user={assigningUser}
        open={Boolean(assigningUser)}
        onOpenChange={(open) => {
          if (!open) setAssigningUser(null)
        }}
        onSave={handleAssignRoles}
        isSaving={assignRolesMutation.isPending}
      />

      {/* Active User Sessions Modal */}
      <UserSessionsModal
        user={sessionsUser}
        open={Boolean(sessionsUser)}
        onOpenChange={(open) => {
          if (!open) setSessionsUser(null)
        }}
      />

      {/* Confirm Delete Role Dialog */}
      <ConfirmDialog
        open={Boolean(deletingRole)}
        onOpenChange={(open) => {
          if (!open) setDeletingRole(null)
        }}
        title={`Delete Role: ${deletingRole?.name}`}
        description="Are you sure you want to permanently delete this custom RBAC role? Any users currently bound to this role will lose its associated privileges."
        confirmLabel="Delete Role"
        variant="destructive"
        onConfirm={handleDeleteRole}
        loading={deleteRoleMutation.isPending}
      />
    </div>
  )
}
