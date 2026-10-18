/**
 * @file tax-sellers-view.tsx
 * @description Seller Tax Profile & CBIC Statutory Seed Configuration.
 * Manages registered GSTIN tax identities, registered state codes, composition/SEZ flags,
 * and provides the one-click CBIC statutory catalog initialization runner.
 */

"use client"

import * as React from "react"
import {
  Building2,
  Plus,
  Database,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ExternalLink,
  MapPin,
  Loader2,
} from "lucide-react"
import {
  useSellerProfilesQuery,
  useUpsertSellerProfileMutation,
} from "@/hooks/use-tax-query"
import { useTaxContext } from "@/context/tax-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  INDIAN_GST_STATES,
  type SellerTaxProfile,
  type UpsertSellerProfilePayload,
} from "@/types/tax"

export function TaxSellersView() {
  const { isSeedModalOpen, setIsSeedModalOpen, handleSeedCBIC, isSeeding } =
    useTaxContext()

  const { data: sellers, isLoading } = useSellerProfilesQuery()
  const [isUpsertOpen, setIsUpsertOpen] = React.useState(false)
  const [editingSeller, setEditingSeller] = React.useState<SellerTaxProfile | null>(null)

  const handleEdit = (seller: SellerTaxProfile) => {
    setEditingSeller(seller)
    setIsUpsertOpen(true)
  }

  const handleCreateNew = () => {
    setEditingSeller(null)
    setIsUpsertOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-foreground">
              Seller GSTIN Tax Profiles &amp; Statutory Setup
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Registered business entities, 15-character statutory GSTINs, and supplier dispatch location state codes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsSeedModalOpen(true)}
            className="h-8.5 text-xs border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 gap-1.5"
          >
            <Database className="size-3.5 text-emerald-600" />
            Seed Standard CBIC Slabs
          </Button>

          <Button
            size="sm"
            onClick={handleCreateNew}
            className="h-8.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-xs"
          >
            <Plus className="size-3.5" />
            Add Seller Profile
          </Button>
        </div>
      </div>

      {/* 2. Seller Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 p-12 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="size-6 animate-spin text-indigo-600" />
            <p className="text-xs text-muted-foreground">
              Loading seller tax profiles...
            </p>
          </div>
        ) : (sellers ?? []).length === 0 ? (
          <div className="col-span-2 p-12 rounded-xl border border-dashed border-border/80 bg-card flex flex-col items-center justify-center text-center space-y-3">
            <Building2 className="size-8 text-muted-foreground" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">
                No Seller GSTIN Profiles Configured
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm">
                Initialize the default Meeo platform seller profile by clicking &quot;Seed Standard CBIC Slabs&quot; or manually add one.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => setIsSeedModalOpen(true)}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
              >
                <Database className="size-3" />
                Run CBIC Seed
              </Button>
            </div>
          </div>
        ) : (
          sellers!.map((seller) => {
            const stateObj = INDIAN_GST_STATES.find(
              (s) => s.code === seller.stateCode
            )

            return (
              <div
                key={seller.id}
                className="p-4 rounded-xl border border-border/80 bg-card hover:border-indigo-500/40 transition-colors shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">
                        {seller.legalName}
                      </h4>
                      {seller.isDefault && (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]"
                        >
                          PRIMARY SELLER
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Trade Name: {seller.tradeName}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(seller)}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Edit
                  </Button>
                </div>

                <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">
                      Statutory GSTIN:
                    </span>
                    <span className="font-bold text-foreground tracking-wider">
                      {seller.gstin}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">
                      State Jurisdiction:
                    </span>
                    <span className="text-foreground">
                      {seller.stateCode} — {stateObj?.name || "State"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">
                      Tax Scheme:
                    </span>
                    <span className="text-foreground">
                      {seller.isComposition ? "Composition Dealer" : "Regular GST"}
                      {seller.isSez ? " (SEZ Unit)" : ""}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 3. Upsert Seller Dialog */}
      <UpsertSellerDialog
        open={isUpsertOpen}
        onOpenChange={setIsUpsertOpen}
        seller={editingSeller}
      />

      {/* 4. CBIC Slabs Seed Confirmation Dialog */}
      <Dialog open={isSeedModalOpen} onOpenChange={setIsSeedModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <Database className="size-4 text-emerald-600" />
              Seed Standard CBIC Statutory Rules &amp; Seller
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Initializes official CBIC standard statutory tax slabs and primary seller profile into the database.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 rounded-lg border border-border/80 bg-muted/40 text-xs space-y-2">
            <p className="font-semibold text-foreground">
              What will be populated:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
              <li>Default Primary Seller: Meeo Retail Technologies (GSTIN 27AAACM1234F1Z5, State 27 - Maharashtra)</li>
              <li>0% Nil-Rated / Essential goods (HSN 0401)</li>
              <li>5% Basic Goods (HSN 1006 - Rice, Cereals)</li>
              <li>12% Processed Goods &amp; Apparel (HSN 6203)</li>
              <li>18% Standard Goods, Laptops &amp; Electronics (HSN 8471, SAC 9965 Freight)</li>
              <li>28% Luxury &amp; Automotive Goods (HSN 8703)</li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSeedModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isSeeding}
              onClick={handleSeedCBIC}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSeeding ? "Seeding Rules..." : "Execute CBIC Seed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function UpsertSellerDialog({
  open,
  onOpenChange,
  seller,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  seller: SellerTaxProfile | null
}) {
  const [legalName, setLegalName] = React.useState("")
  const [tradeName, setTradeName] = React.useState("")
  const [gstin, setGstin] = React.useState("")
  const [stateCode, setStateCode] = React.useState("27")
  const [isComposition, setIsComposition] = React.useState(false)
  const [isSez, setIsSez] = React.useState(false)
  const [isDefault, setIsDefault] = React.useState(true)

  React.useEffect(() => {
    if (seller) {
      setLegalName(seller.legalName)
      setTradeName(seller.tradeName)
      setGstin(seller.gstin)
      setStateCode(seller.stateCode)
      setIsComposition(!!seller.isComposition)
      setIsSez(!!seller.isSez)
      setIsDefault(seller.isDefault ?? true)
    } else {
      setLegalName("Meeo Retail Technologies Pvt Ltd")
      setTradeName("Meeo Store")
      setGstin("27AAACM1234F1Z5")
      setStateCode("27")
      setIsComposition(false)
      setIsSez(false)
      setIsDefault(true)
    }
  }, [seller, open])

  const upsertMutation = useUpsertSellerProfileMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!legalName.trim() || !gstin.trim()) return

    const payload: UpsertSellerProfilePayload = {
      legalName: legalName.trim(),
      tradeName: tradeName.trim() || legalName.trim(),
      gstin: gstin.trim().toUpperCase(),
      stateCode,
      isComposition,
      isSez,
      isDefault,
    }

    await upsertMutation.mutateAsync(payload)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {seller ? "Update Seller Tax Profile" : "Register Seller Tax Profile"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure statutory GSTIN and origin location state code used in POS calculations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              Legal Entity Name *
            </label>
            <Input
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              required
              className="text-xs h-8.5"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              Trade / Brand Name
            </label>
            <Input
              value={tradeName}
              onChange={(e) => setTradeName(e.target.value)}
              className="text-xs h-8.5"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              15-Digit Statutory GSTIN *
            </label>
            <Input
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              placeholder="27AAACM1234F1Z5"
              required
              maxLength={15}
              className="font-mono text-xs h-8.5 uppercase"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              Registered State Jurisdiction *
            </label>
            <select
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="w-full h-8.5 rounded-md border border-input bg-background px-3 text-xs"
            >
              {INDIAN_GST_STATES.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.code} — {state.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-border"
              />
              <span className="font-medium text-foreground">
                Set as Primary Storefront Seller
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isComposition}
                onChange={(e) => setIsComposition(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-muted-foreground">
                Composition Scheme Dealer (Section 10)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isSez}
                onChange={(e) => setIsSez(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-muted-foreground">
                Special Economic Zone (SEZ) Unit
              </span>
            </label>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={upsertMutation.isPending}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {upsertMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
