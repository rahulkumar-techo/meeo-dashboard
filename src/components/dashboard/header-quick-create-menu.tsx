"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus, ShoppingCart, Box, Tag, RefreshCw, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function HeaderQuickCreateMenu() {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-indigo-600 px-2 sm:px-3 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring">
        <Plus className="size-3.5 shrink-0" />
        <span className="hidden sm:inline">Quick Create</span>
        <ChevronDown className="hidden sm:inline size-3 opacity-70" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => router.push("/orders")}
          className="flex items-center gap-2 text-xs font-medium cursor-pointer"
        >
          <ShoppingCart className="size-3.5 text-indigo-500" />
          <span>Create Order</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/products/create")}
          className="flex items-center gap-2 text-xs font-medium cursor-pointer"
        >
          <Box className="size-3.5 text-emerald-500" />
          <span>Add New SKU</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/marketing/promotions")}
          className="flex items-center gap-2 text-xs font-medium cursor-pointer"
        >
          <Tag className="size-3.5 text-amber-500" />
          <span>New Promotion</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/operations/background-jobs")}
          className="flex items-center gap-2 text-xs font-medium cursor-pointer"
        >
          <RefreshCw className="size-3.5 text-blue-500" />
          <span>Trigger Worker Job</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
