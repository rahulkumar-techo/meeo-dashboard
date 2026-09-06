"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavHeader } from "./nav-header"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import {
  SIDEBAR_NAV_GROUPS,
  CURRENT_ADMIN,
  type NavGroup,
  type AdminUser,
} from "./nav-config"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navGroups?: NavGroup[]
  user?: AdminUser
}

export function AppSidebar({
  navGroups = SIDEBAR_NAV_GROUPS,
  user = CURRENT_ADMIN,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="border-r border-border/70 bg-card" {...props}>
      <SidebarHeader className="border-b border-border/40 pb-3 pt-3">
        <NavHeader />
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        <NavMain groups={navGroups} />
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-2">
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}