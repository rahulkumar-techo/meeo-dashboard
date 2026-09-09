"use client"

import * as React from "react"
import { LogOut, MoreVertical, Smartphone } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CURRENT_ADMIN, type AdminUser } from "./nav-config"
import { useUserStore } from "@/store/user.store"
import { useLogoutMutation, useLogoutAllMutation } from "@/hooks/use-auth-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface NavUserProps {
  user?: AdminUser
}

export function NavUser({ user: defaultUser = CURRENT_ADMIN }: NavUserProps) {
  const router = useRouter()
  const { user: authUser, isAuthenticated } = useUserStore()
  const logoutMutation = useLogoutMutation()
  const logoutAllMutation = useLogoutAllMutation()

  const displayName = authUser
    ? `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim() || authUser.email
    : defaultUser.name

  const displayEmail = authUser?.email || defaultUser.email

  const initials = authUser
    ? `${authUser.firstName?.[0] || ""}${authUser.lastName?.[0] || ""}`.toUpperCase() ||
      authUser.email?.[0]?.toUpperCase() ||
      "PA"
    : defaultUser.initials

  const role = authUser?.role || (isAuthenticated ? "Super Admin" : defaultUser.role)

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
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/50 p-2 shadow-2xs">
          <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
            <Avatar className="size-8 shrink-0 rounded-full border border-border/80">
              <AvatarImage src={authUser?.avatar || defaultUser.avatar} alt={displayName} />
              <AvatarFallback className="text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-none truncate min-w-0">
              <span className="truncate font-semibold text-xs text-foreground" title={displayName}>
                {displayName}
              </span>
              <span className="truncate text-[10.5px] font-normal text-muted-foreground mt-0.5 font-mono" title={displayEmail}>
                {displayEmail}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 ml-1 focus-visible:outline-hidden"
              title="Account Options"
            >
              <MoreVertical className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-48">
              <div className="px-2 py-1.5 text-left text-xs">
                <p className="font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{role}</p>
              </div>
              <DropdownMenuSeparator />
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

