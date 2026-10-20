"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
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
          <div className="relative flex aspect-square size-8.5 items-center justify-center rounded-xl bg-card p-1 shadow-2xs ring-1 ring-border/80 overflow-hidden shrink-0">
            <Image
              src="/branding/favicon.svg"
              alt="Meeo Logo"
              width={34}
              height={34}
              className="size-full object-contain"
              priority
            />
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
