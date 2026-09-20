/**
 * @file product-specifications-editor.tsx
 * @description Interactive Table-based Product Specifications Manager for Group -> Key-Value pairs with dedicated Add Group and Add Attribute controls.
 */

"use client"

import * as React from "react"
import { Plus, Trash2, Sparkles, FolderPlus, PlusCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { ProductSpecifications } from "@/types/product"

export interface ProductSpecificationsEditorProps {
  value?: ProductSpecifications | null
  onChange: (specs: ProductSpecifications | null) => void
  disabled?: boolean
}

const COMMON_GROUPS = [
  "General",
  "Display Features",
  "Os & Processor Features",
  "Memory & Storage Features",
  "Camera Features",
  "Battery & Power Features",
  "Connectivity Features",
  "Dimensions & Weight",
  "Warranty",
]

const QUICK_SPEC_SUGGESTIONS: Record<string, string[]> = {
  "General": ["Model Name", "Color", "SIM Type", "In The Box"],
  "Display Features": ["Display Size", "Resolution", "Display Type", "Refresh Rate"],
  "Os & Processor Features": ["Operating System", "Processor Brand", "Processor Type"],
  "Memory & Storage Features": ["Internal Storage", "RAM", "Expandable Storage"],
  "Camera Features": ["Primary Camera", "Secondary Camera", "Flash"],
  "Battery & Power Features": ["Battery Capacity", "Charging Type"],
  "Connectivity Features": ["5G", "Wi-Fi Version", "Bluetooth Version"],
  "Dimensions & Weight": ["Width", "Height", "Depth", "Weight"],
  "Warranty": ["Warranty Summary", "Covered in Warranty"],
}

export function ProductSpecificationsEditor({
  value,
  onChange,
  disabled = false,
}: ProductSpecificationsEditorProps) {
  const specs: ProductSpecifications = React.useMemo(() => value || {}, [value])

  // New Group input state
  const [newGroupName, setNewGroupName] = React.useState("")
  const [groupError, setGroupError] = React.useState<string | null>(null)

  const groupKeys = Object.keys(specs)

  const handleUpdate = (updated: ProductSpecifications) => {
    const cleaned: ProductSpecifications = {}
    for (const [g, rows] of Object.entries(updated)) {
      if (rows && Object.keys(rows).length > 0) {
        cleaned[g] = rows
      }
    }
    onChange(Object.keys(cleaned).length > 0 ? cleaned : null)
  }

  const handleCreateGroup = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const group = newGroupName.trim()
    if (!group) {
      setGroupError("Please enter a group name.")
      return
    }
    if (specs[group]) {
      setGroupError(`Group "${group}" already exists.`)
      return
    }

    setGroupError(null)
    const suggestions = QUICK_SPEC_SUGGESTIONS[group] || ["Feature 1"]
    const newGroupObj: Record<string, string> = {}
    suggestions.forEach((k) => {
      newGroupObj[k] = ""
    })

    handleUpdate({
      ...specs,
      [group]: newGroupObj,
    })
    setNewGroupName("")
  }

  const handleAddAttributeToGroup = (group: string) => {
    const groupData = { ...(specs[group] || {}) }
    const keyNumber = Object.keys(groupData).length + 1
    const newKey = `Property ${keyNumber}`
    groupData[newKey] = ""
    handleUpdate({ ...specs, [group]: groupData })
  }

  const handleCellChange = (group: string, oldKey: string, nextKey: string, nextVal: string) => {
    const groupData = specs[group] || {}
    const newGroupData: Record<string, string> = {}
    for (const [k, v] of Object.entries(groupData)) {
      if (k === oldKey) {
        newGroupData[nextKey] = nextVal
      } else {
        newGroupData[k] = v
      }
    }
    handleUpdate({ ...specs, [group]: newGroupData })
  }

  const handleDeleteRow = (group: string, key: string) => {
    const groupData = { ...(specs[group] || {}) }
    delete groupData[key]
    if (Object.keys(groupData).length === 0) {
      const copy = { ...specs }
      delete copy[group]
      handleUpdate(copy)
    } else {
      handleUpdate({ ...specs, [group]: groupData })
    }
  }

  const handleDeleteGroup = (group: string) => {
    const copy = { ...specs }
    delete copy[group]
    handleUpdate(copy)
  }

  const handleQuickAddGroup = (groupName: string) => {
    if (specs[groupName]) return
    const suggestions = QUICK_SPEC_SUGGESTIONS[groupName] || ["Feature 1"]
    const newGroupObj: Record<string, string> = {}
    suggestions.forEach((k) => {
      newGroupObj[k] = ""
    })
    handleUpdate({ ...specs, [groupName]: newGroupObj })
  }

  const totalSpecsCount = React.useMemo(() => {
    return Object.values(specs).reduce((acc, row) => acc + Object.keys(row || {}).length, 0)
  }, [specs])

  return (
    <div className="space-y-3.5 text-xs">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-indigo-500" />
            <span className="font-bold text-foreground text-xs">Product Specifications Table</span>
            <Badge variant="secondary" className="text-[10px] font-mono font-semibold px-1.5 py-0 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
              {totalSpecsCount} Specs across {groupKeys.length} Groups
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Categorized technical features and attributes for catalog spec sheets.
          </p>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-muted-foreground uppercase font-mono mr-1">Add:</span>
          {COMMON_GROUPS.slice(0, 5).map((g) => {
            const exists = Boolean(specs[g])
            return (
              <button
                key={g}
                type="button"
                onClick={() => !exists && handleQuickAddGroup(g)}
                disabled={disabled || exists}
                className={`text-[10.5px] px-2 py-0.5 rounded-md border transition-all ${
                  exists
                    ? "border-indigo-300 bg-indigo-50/50 text-indigo-600 dark:border-indigo-900/60 dark:bg-indigo-950/30 opacity-60 cursor-default"
                    : "border-border/80 bg-background hover:border-indigo-400 hover:text-indigo-600"
                }`}
              >
                + {g.replace(" Features", "")}
              </button>
            )
          })}
        </div>
      </div>

      {/* Add New Group Bar */}
      <div className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 dark:text-indigo-200 shrink-0">
            <FolderPlus className="size-4 text-indigo-600 dark:text-indigo-400" />
            <span>Create Specification Group:</span>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={newGroupName}
              onChange={(e) => {
                setNewGroupName(e.target.value)
                if (groupError) setGroupError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleCreateGroup()
                }
              }}
              placeholder="e.g. Os & Processor Features, Audio, Connectivity, Warranty..."
              disabled={disabled}
              className="h-8 text-xs bg-background flex-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => handleCreateGroup()}
              disabled={disabled || !newGroupName.trim()}
              className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shrink-0"
            >
              <Plus className="size-3.5" />
              <span>Add Group</span>
            </Button>
          </div>
        </div>
        {groupError && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{groupError}</span>
          </div>
        )}
      </div>

      {/* Specifications Table Container */}
      <div className="rounded-lg border border-border/80 overflow-hidden bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                <th className="py-2.5 px-3 w-[25%] min-w-[130px]">Group Name</th>
                <th className="py-2.5 px-3 w-[35%] min-w-[150px]">Feature / Key</th>
                <th className="py-2.5 px-3 w-[34%] min-w-[160px]">Specification Value</th>
                <th className="py-2.5 px-3 w-[6%] text-center min-w-[45px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {groupKeys.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground bg-muted/5">
                    <p className="font-medium text-foreground text-xs">No specifications added yet</p>
                    <p className="text-[11px] mt-0.5">Use the bar above or quick add pills to create groups.</p>
                  </td>
                </tr>
              ) : (
                groupKeys.map((group) => {
                  const rows = specs[group] || {}
                  const rowEntries = Object.entries(rows)
                  return (
                    <React.Fragment key={group}>
                      {/* Group Header Row with Add Attribute button */}
                      <tr className="bg-indigo-50/50 dark:bg-indigo-950/30 border-t border-indigo-200/60 dark:border-indigo-900/40">
                        <td colSpan={3} className="py-2 px-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-indigo-900 dark:text-indigo-200 text-xs uppercase tracking-wider">
                                {group}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                ({rowEntries.length} {rowEntries.length === 1 ? "spec" : "specs"})
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddAttributeToGroup(group)}
                              disabled={disabled}
                              className="h-6 text-[10.5px] px-2 gap-1 border-indigo-200 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/50"
                            >
                              <PlusCircle className="size-3" />
                              <span>Add Attribute</span>
                            </Button>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteGroup(group)}
                            disabled={disabled}
                            title={`Delete entire ${group} group`}
                            className="text-muted-foreground hover:text-rose-600 transition-colors p-1"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>

                      {/* Specification Key-Value Rows */}
                      {rowEntries.map(([key, val], idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          <td className="py-1.5 px-3 text-muted-foreground text-[11px] font-mono truncate">
                            {group}
                          </td>
                          <td className="py-1.5 px-2">
                            <Input
                              value={key}
                              placeholder="Key Name (e.g. RAM, Display Size)"
                              onChange={(e) => handleCellChange(group, key, e.target.value, val)}
                              disabled={disabled}
                              className="h-7 text-xs font-medium"
                            />
                          </td>
                          <td className="py-1.5 px-2">
                            <Input
                              value={val}
                              placeholder="Value (e.g. 12 GB, 6.8 inch)"
                              onChange={(e) => handleCellChange(group, key, key, e.target.value)}
                              disabled={disabled}
                              className="h-7 text-xs"
                            />
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(group, key)}
                              disabled={disabled}
                              className="text-muted-foreground hover:text-rose-500 p-1 transition-colors"
                              title="Delete Row"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
