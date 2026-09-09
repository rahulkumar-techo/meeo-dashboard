"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { User, Settings, ShieldCheck, LogOut, LogIn, Smartphone } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUserStore } from "@/store/user.store"
import { useLogoutMutation, useLogoutAllMutation } from "@/hooks/use-auth-query"
import { CURRENT_ADMIN } from "@/components/app-sidebar/nav-config"
import { toast } from "sonner"

export function HeaderProfileMenu() {
  const router = useRouter()
  const { user, isAuthenticated } = useUserStore()
  const logoutMutation = useLogoutMutation()
  const logoutAllMutation = useLogoutAllMutation()

  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
    : CURRENT_ADMIN.name

  const displayEmail = user?.email || CURRENT_ADMIN.email

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() ||
      user.email?.[0]?.toUpperCase() ||
      "PA"
    : CURRENT_ADMIN.initials

  const role = user?.role || (isAuthenticated ? "Super Admin" : CURRENT_ADMIN.role)

  const handleSignOut = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        toast.success("Signed out successfully")
        router.push("/login")
      },
    })
  }

  const handleSignOutAll = () => {
    logoutAllMutation.mutate(undefined, {
      onSettled: () => {
        toast.success("Signed out from all devices")
        router.push("/login")
      },
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1 hover:bg-accent focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring transition-colors">
        <Avatar className="size-7.5 sm:size-8 rounded-full border border-border/80">
          <AvatarImage src={user?.avatar || CURRENT_ADMIN.avatar} alt={displayName} />
          <AvatarFallback className="text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="hidden lg:grid text-left leading-tight">
          <span className="text-xs font-semibold text-foreground truncate max-w-[110px]">
            {displayName}
          </span>
          <span className="text-[10px] text-muted-foreground truncate max-w-[110px]">
            {role}
          </span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
          <p className="text-[11px] text-muted-foreground truncate">{displayEmail}</p>
          <div className="pt-1">
            <span className="inline-flex rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {role}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push("/admin/users-roles")}
          className="flex items-center gap-2 text-xs cursor-pointer"
        >
          <User className="size-3.5 text-muted-foreground" />
          <span>Profile & Roles</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/admin/settings")}
          className="flex items-center gap-2 text-xs cursor-pointer"
        >
          <Settings className="size-3.5 text-muted-foreground" />
          <span>System Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/admin/audit-logs")}
          className="flex items-center gap-2 text-xs cursor-pointer"
        >
          <ShieldCheck className="size-3.5 text-muted-foreground" />
          <span>Security & Audit</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {isAuthenticated ? (
          <>
            <DropdownMenuItem
              onClick={handleSignOut}
              className="flex items-center gap-2 text-xs text-rose-600 focus:text-rose-600 cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleSignOutAll}
              className="flex items-center gap-2 text-xs text-rose-600 focus:text-rose-600 cursor-pointer"
            >
              <Smartphone className="size-3.5" />
              <span>Sign Out All Devices</span>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 text-xs text-indigo-600 focus:text-indigo-600 cursor-pointer"
          >
            <LogIn className="size-3.5" />
            <span>Sign In</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

