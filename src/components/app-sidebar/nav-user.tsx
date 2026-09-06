"use client"

import * as React from "react"
import { LogOut } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CURRENT_ADMIN, type AdminUser } from "./nav-config"

interface NavUserProps {
  user?: AdminUser
}

export function NavUser({ user = CURRENT_ADMIN }: NavUserProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/50 p-2 shadow-2xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Avatar className="size-8 rounded-full border border-border/80">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-xs font-semibold bg-indigo-50 text-indigo-700">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-none truncate">
              <span className="truncate font-semibold text-xs text-foreground">
                {user.name}
              </span>
              <span className="truncate text-[10.5px] font-normal text-muted-foreground mt-0.5">
                {user.role}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Sign out"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
