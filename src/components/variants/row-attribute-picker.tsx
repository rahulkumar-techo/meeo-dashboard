/**
 * @file row-attribute-picker.tsx
 * @description Modal dialog attribute picker for individual variant rows, ensuring no clipping by table overflow and full portal rendering.
 */

"use client"

import * as React from "react"
import {
  Tag,
  Plus,
  X,
  Check,
  Search,
  Sparkles,
  Loader2,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  useAttributesQuery,
  useUpdateAttributeMutation,
  useCreateAttributeMutation,
} from "@/hooks/use-attribute-query"
import { usePermissions } from "@/hooks/use-permissions"
import type { Attribute, AttributeValue } from "@/types/attribute"

export interface RowAttributePickerProps {
  selectedIds: string[]
  onChange: (selectedIds: string[], selectedLabels: string[]) => void
  rowLabel?: string
  className?: string
}

export function RowAttributePicker({
  selectedIds = [],
  onChange,
  rowLabel,
  className = "",
}: RowAttributePickerProps) {
  const { isSuperAdmin } = usePermissions()
  const { data: attributesData, isLoading, refetch } = useAttributesQuery({ limit: 100 })
  const updateAttributeMutation = useUpdateAttributeMutation()
  const createAttributeMutation = useCreateAttributeMutation()

  const attributes: Attribute[] = attributesData?.items ?? []

  const [isOpen, setIsOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [activeAddingAttrId, setActiveAddingAttrId] = React.useState<string | null>(null)
  const [inlineValueInput, setInlineValueInput] = React.useState("")
  const [inlineValueError, setInlineValueError] = React.useState<string | null>(null)

  // Quick New Attribute inline creation state
  const [isCreatingNewAttr, setIsCreatingNewAttr] = React.useState(false)
  const [newAttrName, setNewAttrName] = React.useState("")
  const [newAttrValue, setNewAttrValue] = React.useState("")
  const [newAttrError, setNewAttrError] = React.useState<string | null>(null)

  // Map of selected items with their parent attribute names
  const selectedDetails = React.useMemo(() => {
    const list: { id: string; value: string; attrName: string; attrId: string }[] = []
    attributes.forEach((attr) => {
      attr.values?.forEach((v) => {
        if (selectedIds.includes(v.id)) {
          list.push({
            id: v.id,
            value: v.value,
            attrName: attr.name,
            attrId: attr.id,
          })
        }
      })
    })
    return list
  }, [attributes, selectedIds])

  // Filter attributes based on search
  const filteredAttributes = React.useMemo(() => {
    if (!search.trim()) return attributes
    const q = search.toLowerCase()
    return attributes.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.values?.some((v) => v.value.toLowerCase().includes(q))
    )
  }, [attributes, search])

  // Toggle value selection
  const handleToggleValue = (valId: string) => {
    let nextIds: string[]
    if (selectedIds.includes(valId)) {
      nextIds = selectedIds.filter((id) => id !== valId)
    } else {
      nextIds = [...selectedIds, valId]
    }

    // Build labels for nextIds
    const nextLabels: string[] = []
    attributes.forEach((attr) => {
      attr.values?.forEach((v) => {
        if (nextIds.includes(v.id)) {
          nextLabels.push(v.value)
        }
      })
    })

    onChange(nextIds, nextLabels)
  }

  // Remove a single value by ID directly from badge
  const handleRemoveValue = (valId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const nextIds = selectedIds.filter((id) => id !== valId)
    const nextLabels: string[] = []
    attributes.forEach((attr) => {
      attr.values?.forEach((v) => {
        if (nextIds.includes(v.id)) {
          nextLabels.push(v.value)
        }
      })
    })
    onChange(nextIds, nextLabels)
  }

  // Inline value addition for existing attribute
  const handleAddValueSubmit = async (attr: Attribute) => {
    setInlineValueError(null)
    const raw = inlineValueInput.trim()
    if (!raw) return

    const existingVals = attr.values?.map((v) => v.value.toLowerCase()) ?? []
    if (existingVals.includes(raw.toLowerCase())) {
      setInlineValueError(`Value '${raw}' already exists in ${attr.name}.`)
      return
    }

    try {
      const res = await updateAttributeMutation.mutateAsync({
        id: attr.id,
        payload: {
          values: [raw],
        },
      })
      const refetched = await refetch()
      const currentList = refetched.data?.items ?? []
      const freshAttr = currentList.find((a) => a.id === attr.id) || res.data

      setInlineValueInput("")
      setActiveAddingAttrId(null)

      // Auto-select the newly added value
      const createdVal = freshAttr?.values?.find(
        (v: AttributeValue) => v.value.toLowerCase() === raw.toLowerCase()
      )
      if (createdVal?.id && !selectedIds.includes(createdVal.id)) {
        handleToggleValue(createdVal.id)
      }
    } catch (err: any) {
      setInlineValueError(err.response?.data?.message || err.message || "Failed to add value.")
    }
  }

  // Create brand new attribute on the fly
  const handleCreateNewAttrSubmit = async () => {
    setNewAttrError(null)
    const rawName = newAttrName.trim()
    const rawVal = newAttrValue.trim()
    if (!rawName) {
      setNewAttrError("Attribute name is required.")
      return
    }

    try {
      const res = await createAttributeMutation.mutateAsync({
        name: rawName,
        values: rawVal ? [rawVal] : undefined,
        isGlobal: isSuperAdmin ? true : false,
        status: isSuperAdmin ? "APPROVED" : "PENDING_APPROVAL",
      })

      const created = res.data || (res as any)
      await refetch()

      setNewAttrName("")
      setNewAttrValue("")
      setIsCreatingNewAttr(false)

      // Auto-select first value if created
      if (created?.values && created.values.length > 0) {
        const first = created.values[0]
        if (first?.id && !selectedIds.includes(first.id)) {
          handleToggleValue(first.id)
        }
      }
    } catch (err: any) {
      setNewAttrError(err.response?.data?.message || err.message || "Failed to create attribute.")
    }
  }

  return (
    <div className={`flex flex-wrap items-center gap-1.5 min-h-[34px] ${className}`}>
      {/* Selected Attribute Badges */}
      {selectedDetails.map((item) => (
        <Badge
          key={item.id}
          variant="secondary"
          className="text-[11px] font-medium pl-2 pr-1 py-0.5 bg-indigo-50/90 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/70 flex items-center gap-1 shadow-2xs hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-all"
        >
          <span className="text-muted-foreground font-normal text-[10px] capitalize">
            {item.attrName}:
          </span>
          <span className="font-semibold capitalize">{item.value}</span>
          <button
            type="button"
            onClick={(e) => handleRemoveValue(item.id, e)}
            className="size-3.5 flex items-center justify-center rounded-full hover:bg-indigo-200/70 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-300 ml-0.5 cursor-pointer"
            title={`Remove ${item.value}`}
          >
            <X className="size-2.5" />
          </button>
        </Badge>
      ))}

      {/* Button to Open Dialog */}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={`h-7 px-2 text-[11px] font-medium gap-1 transition-all cursor-pointer ${
          selectedIds.length === 0
            ? "border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20"
            : "h-6.5 px-1.5 text-[10px] bg-muted/40 hover:bg-muted text-foreground border-border/60"
        }`}
      >
        {selectedIds.length === 0 ? (
          <>
            <Tag className="size-3 text-indigo-600 dark:text-indigo-400" />
            <span>+ Select Attributes</span>
          </>
        ) : (
          <>
            <Plus className="size-3" />
            <span>Add / Edit</span>
          </>
        )}
      </Button>

      {/* Full Modal Dialog (Rendered via Portal to avoid any table overflow clipping) */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[540px] max-h-[85vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          {/* Dialog Header */}
          <div className="p-4 pb-3 border-b border-border/70 bg-muted/10">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <SlidersHorizontal className="size-4" />
                </div>
                <div>
                  <DialogTitle className="text-sm font-bold">
                    {rowLabel ? `Select Attributes (${rowLabel})` : "Select Variant Attributes"}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Select 2 or more attributes (Color, Size, Material, etc.) to assign to this variant.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Dialog Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter attributes or options (e.g. Cyan, Cotton, XL)..."
                className="h-8 pl-8 text-xs bg-muted/20"
                autoFocus
              />
            </div>

            {/* Currently Selected Summary */}
            {selectedDetails.length > 0 && (
              <div className="p-2.5 rounded-lg border border-indigo-200/70 bg-indigo-50/40 dark:border-indigo-900/60 dark:bg-indigo-950/30 flex items-center justify-between flex-wrap gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-foreground mr-1">
                    Selected ({selectedDetails.length}):
                  </span>
                  {selectedDetails.map((item) => (
                    <Badge
                      key={item.id}
                      variant="secondary"
                      className="text-[10px] font-medium pl-1.5 pr-1 py-0.5 bg-indigo-100 dark:bg-indigo-900/80 text-indigo-900 dark:text-indigo-200 flex items-center gap-1"
                    >
                      <span>{item.attrName}: {item.value}</span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveValue(item.id, e)}
                        className="size-3 flex items-center justify-center rounded-full hover:bg-indigo-300 dark:hover:bg-indigo-700"
                      >
                        <X className="size-2" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange([], [])}
                  className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-rose-500"
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Attributes List */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-indigo-500" />
                  <span className="text-xs">Loading master attributes...</span>
                </div>
              ) : filteredAttributes.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No matching attributes found.
                </div>
              ) : (
                filteredAttributes.map((attr) => {
                  const values = attr.values ?? []
                  const isAdding = activeAddingAttrId === attr.id

                  return (
                    <div
                      key={attr.id}
                      className="p-3 rounded-xl border border-border/60 bg-card space-y-2"
                    >
                      {/* Attribute Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground text-xs capitalize">
                            {attr.name}
                          </span>
                          {attr.isGlobal ? (
                            <Badge
                              variant="secondary"
                              className="text-[9px] px-1 py-0 h-3.5 bg-sky-500/10 text-sky-600 border-sky-500/20"
                            >
                              Global Master
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-[9px] px-1 py-0 h-3.5 bg-amber-500/10 text-amber-600 border-amber-500/20"
                            >
                              Custom
                            </Badge>
                          )}
                        </div>

                        {!isAdding && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveAddingAttrId(attr.id)
                              setInlineValueInput("")
                              setInlineValueError(null)
                            }}
                            className="text-[11px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium flex items-center gap-0.5 cursor-pointer"
                          >
                            <Plus className="size-3" />
                            <span>Add Value</span>
                          </button>
                        )}
                      </div>

                      {/* Inline Value Input */}
                      {isAdding && (
                        <div className="space-y-1 pt-1 pb-1">
                          <div className="flex items-center gap-1.5">
                            <Input
                              value={inlineValueInput}
                              onChange={(e) => setInlineValueInput(e.target.value)}
                              placeholder={`New ${attr.name} value...`}
                              className="h-7 text-xs"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  handleAddValueSubmit(attr)
                                }
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleAddValueSubmit(attr)}
                              disabled={updateAttributeMutation.isPending || !inlineValueInput.trim()}
                              className="h-7 px-2.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              {updateAttributeMutation.isPending ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                "Add"
                              )}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setActiveAddingAttrId(null)}
                              className="h-7 px-2 text-muted-foreground hover:text-foreground"
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>
                          {inlineValueError && (
                            <p className="text-[10px] text-rose-500">{inlineValueError}</p>
                          )}
                        </div>
                      )}

                      {/* Option Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {values.length === 0 ? (
                          <span className="text-[11px] text-muted-foreground italic">
                            No options configured. Click &quot;Add Value&quot; to add one.
                          </span>
                        ) : (
                          values.map((v) => {
                            const isSelected = selectedIds.includes(v.id)
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => handleToggleValue(v.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                                  isSelected
                                    ? "bg-indigo-600 text-white shadow-xs"
                                    : "bg-muted/40 border border-border/80 text-foreground hover:border-indigo-400 hover:bg-muted"
                                }`}
                              >
                                {isSelected && <Check className="size-3" />}
                                <span className="capitalize">{v.value}</span>
                              </button>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Create New Master Attribute Accordion */}
            <div className="pt-2 border-t border-border/60">
              {!isCreatingNewAttr ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreatingNewAttr(true)}
                  className="w-full h-8 text-xs text-indigo-600 dark:text-indigo-400 border-dashed border-indigo-300 dark:border-indigo-800 hover:bg-indigo-500/10 justify-center gap-1.5"
                >
                  <Plus className="size-3.5" />
                  <span>+ Create Brand New Attribute</span>
                </Button>
              ) : (
                <div className="p-3 rounded-xl border border-indigo-200/80 bg-indigo-50/40 dark:border-indigo-900/50 dark:bg-indigo-950/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      Create Brand New Attribute
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewAttr(false)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={newAttrName}
                      onChange={(e) => setNewAttrName(e.target.value)}
                      placeholder="Name (e.g. Storage, Material)"
                      className="h-7.5 text-xs bg-background"
                    />
                    <Input
                      value={newAttrValue}
                      onChange={(e) => setNewAttrValue(e.target.value)}
                      placeholder="Initial Value (e.g. 512GB, Silk)"
                      className="h-7.5 text-xs bg-background"
                    />
                  </div>
                  {newAttrError && <p className="text-[10px] text-rose-500">{newAttrError}</p>}
                  <div className="flex justify-end gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsCreatingNewAttr(false)}
                      className="h-7 px-2.5 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateNewAttrSubmit}
                      disabled={createAttributeMutation.isPending || !newAttrName.trim()}
                      className="h-7 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                    >
                      {createAttributeMutation.isPending ? (
                        <Loader2 className="size-3 animate-spin mr-1" />
                      ) : null}
                      <span>Create & Select</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dialog Footer */}
          <div className="p-3 px-4 border-t border-border/70 bg-muted/10 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {selectedDetails.length} attribute{selectedDetails.length === 1 ? "" : "s"} selected
            </span>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 text-xs px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
            >
              Done & Attach
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
