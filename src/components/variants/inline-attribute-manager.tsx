/**
 * @file inline-attribute-manager.tsx
 * @description Inline Attribute & Value Manager supporting real-time creation/proposing of attributes and values for New Variant and Matrix Generator dialogs.
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
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  useAttributesQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
} from "@/hooks/use-attribute-query"
import { usePermissions } from "@/hooks/use-permissions"
import type { Attribute, AttributeValue } from "@/types/attribute"

export type AttributeSelectionMode = "single" | "matrix"

export interface SelectedAttributeDetail {
  id: string
  value: string
  attributeName?: string
  attributeId?: string
}

export interface InlineAttributeManagerProps {
  mode: AttributeSelectionMode
  /**
   * For single mode: array of selected value IDs
   */
  selectedSingleValueIds?: string[]
  onSingleSelectionChange?: (selectedIds: string[]) => void
  onSingleSelectionDetailsChange?: (details: SelectedAttributeDetail[]) => void

  /**
   * For matrix mode: map of attributeId -> array of selected { id, value } objects
   */
  selectedMatrixValues?: Record<string, { id: string; value: string }[]>
  onMatrixSelectionChange?: (
    values: Record<string, { id: string; value: string }[]>
  ) => void

  className?: string
}

export function InlineAttributeManager({
  mode,
  selectedSingleValueIds = [],
  onSingleSelectionChange,
  onSingleSelectionDetailsChange,
  selectedMatrixValues = {},
  onMatrixSelectionChange,
  className = "",
}: InlineAttributeManagerProps) {
  const { isSuperAdmin } = usePermissions()

  // Queries & Mutations
  const { data: attributesData, isLoading, refetch } = useAttributesQuery({ limit: 100 })
  const createAttributeMutation = useCreateAttributeMutation()
  const updateAttributeMutation = useUpdateAttributeMutation()

  const attributes: Attribute[] = attributesData?.items ?? []

  // Notify parent of selected attribute details (for instant SKU auto-generation and labels)
  React.useEffect(() => {
    if (mode === "single" && onSingleSelectionDetailsChange && attributes.length > 0) {
      const details: SelectedAttributeDetail[] = []
      attributes.forEach((attr) => {
        attr.values?.forEach((v) => {
          if (selectedSingleValueIds.includes(v.id)) {
            details.push({
              id: v.id,
              value: v.value,
              attributeName: attr.name,
              attributeId: attr.id,
            })
          }
        })
      })
      onSingleSelectionDetailsChange(details)
    }
  }, [mode, selectedSingleValueIds, attributes, onSingleSelectionDetailsChange])

  // Local UI states
  const [search, setSearch] = React.useState("")
  const [isProposeOpen, setIsProposeOpen] = React.useState(false)
  const [newAttrName, setNewAttrName] = React.useState("")
  const [newAttrTagInput, setNewAttrTagInput] = React.useState("")
  const [newAttrValues, setNewAttrValues] = React.useState<string[]>([])
  const [proposeError, setProposeError] = React.useState<string | null>(null)

  // Adding value inline to an existing attribute
  const [activeAddingAttrId, setActiveAddingAttrId] = React.useState<string | null>(null)
  const [inlineValueInput, setInlineValueInput] = React.useState("")
  const [inlineValueError, setInlineValueError] = React.useState<string | null>(null)

  // Filter attributes by search
  const filteredAttributes = React.useMemo(() => {
    if (!search.trim()) return attributes
    const q = search.toLowerCase()
    return attributes.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.values?.some((v) => v.value.toLowerCase().includes(q))
    )
  }, [attributes, search])

  // Count total selected options
  const totalSelectedCount = React.useMemo(() => {
    if (mode === "single") {
      return selectedSingleValueIds.length
    }
    return Object.values(selectedMatrixValues).reduce(
      (acc, list) => acc + (list?.length ?? 0),
      0
    )
  }, [mode, selectedSingleValueIds, selectedMatrixValues])

  // Single mode toggle handler
  const handleToggleSingleValue = (valId: string) => {
    if (!onSingleSelectionChange) return
    const exists = selectedSingleValueIds.includes(valId)
    const updated = exists
      ? selectedSingleValueIds.filter((id) => id !== valId)
      : [...selectedSingleValueIds, valId]
    onSingleSelectionChange(updated)
  }

  // Matrix mode toggle handler
  const handleToggleMatrixValue = (attrId: string, val: { id: string; value: string }) => {
    if (!onMatrixSelectionChange) return
    const currentList = selectedMatrixValues[attrId] || []
    const exists = currentList.some((item) => item.id === val.id)
    const updated = exists
      ? currentList.filter((item) => item.id !== val.id)
      : [...currentList, val]

    const nextState = { ...selectedMatrixValues }
    if (updated.length === 0) {
      delete nextState[attrId]
    } else {
      nextState[attrId] = updated
    }
    onMatrixSelectionChange(nextState)
  }

  // Handle adding initial values in propose form
  const handleAddProposeTag = () => {
    const raw = newAttrTagInput.trim()
    if (!raw) return
    const parts = raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !newAttrValues.includes(s))
    if (parts.length > 0) {
      setNewAttrValues((prev) => [...prev, ...parts])
      setNewAttrTagInput("")
    }
  }

  // Submit Propose New Attribute
  const handleCreateAttributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProposeError(null)

    const trimmedName = newAttrName.trim()
    if (!trimmedName) {
      setProposeError("Attribute name is required.")
      return
    }

    // Check duplicate name
    const exists = attributes.some(
      (a) => a.name.toLowerCase() === trimmedName.toLowerCase()
    )
    if (exists) {
      setProposeError(`Attribute '${trimmedName}' already exists.`)
      return
    }

    const payloadValues = [...newAttrValues]
    if (newAttrTagInput.trim()) {
      const pending = newAttrTagInput
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !payloadValues.includes(s))
      payloadValues.push(...pending)
    }

    try {
      const res = await createAttributeMutation.mutateAsync({
        name: trimmedName,
        values: payloadValues.length > 0 ? payloadValues : undefined,
        isGlobal: isSuperAdmin ? true : false,
        status: isSuperAdmin ? "APPROVED" : "PENDING_APPROVAL",
      })

      const createdAttr = res.data || (res as any)
      await refetch()

      // Reset propose form
      setNewAttrName("")
      setNewAttrTagInput("")
      setNewAttrValues([])
      setIsProposeOpen(false)

      // Automatically select created values
      if (createdAttr?.values && createdAttr.values.length > 0) {
        if (mode === "single") {
          const firstVal = createdAttr.values[0]
          if (firstVal?.id && onSingleSelectionChange) {
            onSingleSelectionChange([...selectedSingleValueIds, firstVal.id])
          }
        } else if (mode === "matrix") {
          if (onMatrixSelectionChange) {
            const mapped = createdAttr.values.map((v: any) => ({
              id: v.id,
              value: v.value,
            }))
            onMatrixSelectionChange({
              ...selectedMatrixValues,
              [createdAttr.id]: mapped,
            })
          }
        }
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to create master attribute."
      setProposeError(msg)
    }
  }

  // Submit Inline Value Addition to existing Attribute
  const handleAddInlineValueSubmit = async (attr: Attribute) => {
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

      const updatedAttr = res.data || (res as any)
      const refetched = await refetch()
      const currentList = refetched.data?.items ?? []
      const freshAttr = currentList.find((a) => a.id === attr.id) || updatedAttr

      setInlineValueInput("")
      setActiveAddingAttrId(null)

      // Auto-select newly created value
      const createdVal = freshAttr?.values?.find(
        (v: AttributeValue) => v.value.toLowerCase() === raw.toLowerCase()
      )

      if (createdVal?.id) {
        if (mode === "single" && onSingleSelectionChange) {
          if (!selectedSingleValueIds.includes(createdVal.id)) {
            onSingleSelectionChange([...selectedSingleValueIds, createdVal.id])
          }
        } else if (mode === "matrix" && onMatrixSelectionChange) {
          const currentMatrixList = selectedMatrixValues[attr.id] || []
          if (!currentMatrixList.some((item) => item.id === createdVal.id)) {
            onMatrixSelectionChange({
              ...selectedMatrixValues,
              [attr.id]: [
                ...currentMatrixList,
                { id: createdVal.id, value: createdVal.value },
              ],
            })
          }
        }
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to append attribute value."
      setInlineValueError(msg)
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header & Propose Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Tag className="size-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>Variant Attributes & Options</span>
              <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 h-4">
                {totalSelectedCount} selected
              </Badge>
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {isSuperAdmin
                ? "Admin Mode: Select or create global master attributes."
                : "Vendor Mode: Use approved attributes or propose new custom attributes."}
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setIsProposeOpen(!isProposeOpen)}
          className={`h-7.5 px-2.5 text-xs gap-1.5 font-medium transition-all ${
            isProposeOpen
              ? "bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <Plus className="size-3 text-indigo-600 dark:text-indigo-400" />
          <span>{isSuperAdmin ? "Create Global Attribute" : "Propose New Attribute"}</span>
          {isProposeOpen ? (
            <ChevronUp className="size-3 ml-0.5" />
          ) : (
            <ChevronDown className="size-3 ml-0.5" />
          )}
        </Button>
      </div>

      {/* Propose/Create New Attribute Inline Drawer/Card */}
      {isProposeOpen && (
        <div className="p-3.5 rounded-xl border border-indigo-200/80 bg-indigo-50/40 dark:border-indigo-900/50 dark:bg-indigo-950/30 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{isSuperAdmin ? "New Global Master Attribute" : "Propose New Custom Attribute"}</span>
            </span>
            <Badge
              variant="outline"
              className={`text-[10px] font-medium ${
                isSuperAdmin
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300"
              }`}
            >
              {isSuperAdmin ? "Instant Global Approval" : "Vendor Proposed (Auto-Active)"}
            </Badge>
          </div>

          {proposeError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50/90 p-2 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-1.5">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>{proposeError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">
                Attribute Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={newAttrName}
                onChange={(e) => setNewAttrName(e.target.value)}
                placeholder="e.g. Fabric Material, Dial Size"
                className="h-8 text-xs bg-background"
                disabled={createAttributeMutation.isPending}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">
                Initial Option Values (Enter or comma separated)
              </label>
              <div className="flex gap-1.5">
                <Input
                  value={newAttrTagInput}
                  onChange={(e) => setNewAttrTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault()
                      handleAddProposeTag()
                    }
                  }}
                  placeholder="e.g. 100% Cotton, Silk"
                  className="h-8 text-xs bg-background"
                  disabled={createAttributeMutation.isPending}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddProposeTag}
                  className="h-8 text-xs px-2.5 bg-background shrink-0"
                >
                  <Plus className="size-3" />
                  <span>Add</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Tags preview in propose form */}
          {newAttrValues.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {newAttrValues.map((val) => (
                <Badge
                  key={val}
                  variant="secondary"
                  className="text-xs font-normal pl-2 pr-1 py-0.5 gap-1 bg-background border border-indigo-200 dark:border-indigo-800 text-foreground"
                >
                  <span>{val}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setNewAttrValues((prev) => prev.filter((v) => v !== val))
                    }
                    className="rounded hover:bg-muted p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <p className="text-[10.5px] text-muted-foreground flex items-center gap-1">
              <HelpCircle className="size-3" />
              <span>
                {isSuperAdmin
                  ? "Attributes created here will be immediately available across all platform products."
                  : "Attributes proposed here can be used in your variants now and submitted for global review."}
              </span>
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsProposeOpen(false)
                  setProposeError(null)
                }}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleCreateAttributeSubmit}
                disabled={createAttributeMutation.isPending}
                className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5 shadow-2xs"
              >
                {createAttributeMutation.isPending ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3" />
                    <span>{isSuperAdmin ? "Save Global Attribute" : "Propose Attribute"}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filter / Search Bar */}
      {attributes.length > 3 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attributes & options..."
            className="pl-7.5 h-7.5 text-xs bg-background"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      )}

      {/* Attributes List */}
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin text-indigo-600" />
            <span>Loading master attributes...</span>
          </div>
        ) : filteredAttributes.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-border/80 bg-muted/10 text-center space-y-2">
            <Tag className="size-5 mx-auto text-muted-foreground" />
            <p className="text-xs font-semibold text-foreground">
              {search ? "No matching attributes found" : "No attributes configured"}
            </p>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              {search
                ? "Try searching for a different option or propose a new attribute above."
                : "Create or propose your first variant attribute (e.g., Color, Size, Storage) to configure product variants."}
            </p>
            {!isProposeOpen && (
              <Button
                type="button"
                size="sm"
                onClick={() => setIsProposeOpen(true)}
                className="h-7 text-xs bg-indigo-600 text-white gap-1 mt-1"
              >
                <Plus className="size-3" />
                <span>{isSuperAdmin ? "Create Global Attribute" : "Propose Attribute"}</span>
              </Button>
            )}
          </div>
        ) : (
          filteredAttributes.map((attr) => {
            const values = attr.values ?? []
            const isApproved =
              attr.isGlobal ||
              attr.status === "APPROVED" ||
              (!attr.status && !attr.vendorId)
            const isAddingValue = activeAddingAttrId === attr.id

            // Check matrix selection count for this attribute
            const matrixSelectedCount =
              mode === "matrix" ? selectedMatrixValues[attr.id]?.length ?? 0 : 0

            return (
              <div
                key={attr.id}
                className="p-3 rounded-xl border border-border/70 bg-card hover:border-border transition-colors space-y-2"
              >
                {/* Attribute Card Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {attr.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[9.5px] font-medium px-1.5 py-0 h-4 ${
                        isApproved
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
                          : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300"
                      }`}
                    >
                      {isApproved ? (
                        <span className="flex items-center gap-0.5">
                          <ShieldCheck className="size-2.5" />
                          <span>Global</span>
                        </span>
                      ) : (
                        <span>Proposed</span>
                      )}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {mode === "matrix" && matrixSelectedCount > 0 && (
                      <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                        {matrixSelectedCount} selected
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveAddingAttrId(isAddingValue ? null : attr.id)
                        setInlineValueInput("")
                        setInlineValueError(null)
                      }}
                      className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="size-3" />
                      <span>Add Value</span>
                    </button>
                  </div>
                </div>

                {/* Inline Add Value Form for this attribute */}
                {isAddingValue && (
                  <div className="p-2 rounded-lg bg-muted/40 border border-indigo-200 dark:border-indigo-900/60 space-y-1.5 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={inlineValueInput}
                        onChange={(e) => setInlineValueInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddInlineValueSubmit(attr)
                          }
                        }}
                        placeholder={`Add new option for ${attr.name}...`}
                        className="h-7 text-xs bg-background"
                        autoFocus
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleAddInlineValueSubmit(attr)}
                        disabled={updateAttributeMutation.isPending || !inlineValueInput.trim()}
                        className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-2.5 shrink-0"
                      >
                        {updateAttributeMutation.isPending ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <span>Add</span>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActiveAddingAttrId(null)
                          setInlineValueError(null)
                        }}
                        className="h-7 text-xs px-2"
                      >
                        <X className="size-3" />
                      </Button>
                    </div>
                    {inlineValueError && (
                      <p className="text-[10.5px] text-rose-600 dark:text-rose-400">
                        {inlineValueError}
                      </p>
                    )}
                  </div>
                )}

                {/* Value Buttons */}
                {values.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground italic">
                    No values added yet. Click &quot;+ Add Value&quot; to define options.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {values.map((v) => {
                      let isSelected = false
                      if (mode === "single") {
                        isSelected = selectedSingleValueIds.includes(v.id)
                      } else {
                        isSelected =
                          selectedMatrixValues[attr.id]?.some((item) => item.id === v.id) ??
                          false
                      }

                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            if (mode === "single") {
                              handleToggleSingleValue(v.id)
                            } else {
                              handleToggleMatrixValue(attr.id, {
                                id: v.id,
                                value: v.value,
                              })
                            }
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs font-semibold"
                              : "bg-background text-foreground border-border/70 hover:border-indigo-500/50 hover:bg-muted/30"
                          }`}
                        >
                          {isSelected && <Check className="size-3 shrink-0" />}
                          <span>{v.value}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
