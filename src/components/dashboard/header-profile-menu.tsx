"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { User, Settings, ShieldCheck, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CURRENT_ADMIN } from "@/components/app-sidebar/nav-config"

export function HeaderProfileMenu() {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1 hover:bg-accent focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring transition-colors">
        <Avatar className="size-7.5 sm:size-8 rounded-full border border-border/80">
          <AvatarImage src={CURRENT_ADMIN.avatar} alt={CURRENT_ADMIN.name} />
          <AvatarFallback className="text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {CURRENT_ADMIN.initials}
          </AvatarFallback>
        </Avatar>

        <div className="hidden lg:grid text-left leading-tight">
          <span className="text-xs font-semibold text-foreground truncate max-w-[110px]">
            {CURRENT_ADMIN.name}
          </span>
          <span className="text-[10px] text-muted-foreground truncate max-w-[110px]">
            Operations Lead
          </span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-xs font-semibold text-foreground">{CURRENT_ADMIN.name}</p>
          <p className="text-[11px] text-muted-foreground">{CURRENT_ADMIN.email}</p>
          <div className="pt-1">
            <span className="inline-flex rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {CURRENT_ADMIN.role}
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

        <DropdownMenuItem className="flex items-center gap-2 text-xs text-rose-600 focus:text-rose-600 cursor-pointer">
          <LogOut className="size-3.5" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
