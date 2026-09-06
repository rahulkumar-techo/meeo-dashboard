"use client"

import * as React from "react"
import Link from "next/link"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          render={<Link href="/" />}
          tooltip={{
            children: "Meeo • Commerce Platform",
          }}
          className="hover:bg-transparent focus-visible:ring-0 p-1"
        >
          <div className="flex aspect-square size-8.5 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white font-black text-base shadow-sm ring-1 ring-white/20">
            <svg
              className="size-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 18V6l8 8 8-8v12" />
              <circle cx="12" cy="18" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div className="grid flex-1 text-left leading-none ml-1">
            <span className="font-extrabold text-[15px] tracking-tight text-foreground">
              Meeo
            </span>
            <span className="text-[10.5px] font-medium text-muted-foreground mt-0.5 tracking-wide">
              Commerce Engine
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
