/**
 * @file tax.ts
 * @description TypeScript definitions for the Meeo GST Statutory Tax Engine.
 * Covers rule lifecycles (DRAFT -> APPROVED -> ACTIVE / SCHEDULED -> RETIRED),
 * HSN/SAC classifications, dual-authorization approvals, immutable audits,
 * place-of-supply (POS) calculation, reconciliation, and seller tax profiles.
 */

export type TaxTreatment = "TAXABLE" | "EXEMPT" | "NIL_RATED" | "NON_GST"

export type TaxRuleStatus =
  | "DRAFT"
  | "APPROVED"
  | "SCHEDULED"
  | "ACTIVE"
  | "RETIRED"

export type ClassificationStatus = "VERIFIED" | "UNVERIFIED"

export interface TaxRuleAudit {
  id: string
  ruleId: string
  action: "CREATE" | "APPROVE" | "PUBLISH" | "RETIRE" | "SUPERSEDE" | string
  performedBy: string
  performedByEmail?: string
  previousState?: Record<string, unknown> | null
  newState?: Record<string, unknown> | null
  reason?: string | null
  createdAt: string
}

export interface TaxRule {
  id: string
  hsnCode: string
  taxTreatment: TaxTreatment
  cgstRate: number
  sgstRate: number
  igstRate: number
  cessRate?: number
  effectiveFrom: string
  effectiveTo?: string | null
  status: TaxRuleStatus
  version: number
  notificationRef?: string | null
  description?: string | null
  approvedBy?: string | null
  approvedAt?: string | null
  approvalReason?: string | null
  createdAt: string
  updatedAt: string
  audits?: TaxRuleAudit[]
}

export interface TaxClassification {
  id: string
  hsnCode: string
  description: string
  category?: string | null
  verificationStatus: ClassificationStatus
  verifiedBy?: string | null
  verifiedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface SellerTaxProfile {
  id: string
  legalName: string
  tradeName: string
  gstin: string
  stateCode: string
  isComposition?: boolean
  isSez?: boolean
  isDefault?: boolean
  address?: string | null
  city?: string | null
  pincode?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTaxRulePayload {
  hsnCode: string
  taxTreatment: TaxTreatment
  cgstRate: number
  sgstRate: number
  igstRate: number
  cessRate?: number
  effectiveFrom: string
  effectiveTo?: string | null
  notificationRef: string
  description?: string
}

export interface ApproveTaxRulePayload {
  reason: string
  verifiedGazetteRef?: string
}

export interface RetireTaxRulePayload {
  reason?: string
}

export interface CreateTaxClassificationPayload {
  hsnCode: string
  description: string
  category?: string
  verificationStatus?: ClassificationStatus
}

export interface UpdateClassificationStatusPayload {
  status: ClassificationStatus
}

export interface UpsertSellerProfilePayload {
  legalName: string
  tradeName: string
  gstin: string
  stateCode: string
  isComposition?: boolean
  isSez?: boolean
  isDefault?: boolean
}

export interface TaxRulesQueryParams {
  status?: TaxRuleStatus | "ALL"
  hsnCode?: string
  search?: string
  page?: number
  limit?: number
}

export interface TaxClassificationsQueryParams {
  search?: string
  status?: ClassificationStatus | "ALL"
  page?: number
  limit?: number
}

export interface TaxQuoteItemInput {
  hsnCode: string
  taxableAmount: number
  quantity: number
  discountAmount?: number
}

export interface TaxQuotePayload {
  sellerStateCode: string
  customerStateCode: string
  items: TaxQuoteItemInput[]
  shippingFee?: number
}

export interface TaxQuoteItemBreakdown {
  hsnCode: string
  taxableAmount: number
  cgstRate: number
  cgstAmount: number
  sgstRate: number
  sgstAmount: number
  igstRate: number
  igstAmount: number
  totalTax: number
  totalAmount: number
}

export interface TaxQuoteShippingBreakdown {
  shippingFee: number
  taxableValue: number
  gstRate: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  totalTax: number
}

export interface TaxQuoteResult {
  isInterState: boolean
  sellerStateCode: string
  customerStateCode: string
  placeOfSupplyStateCode: string
  totalTaxableAmount: number
  totalCgstAmount: number
  totalSgstAmount: number
  totalIgstAmount: number
  totalTaxAmount: number
  shippingTaxableAmount: number
  shippingTaxAmount: number
  grandTotal: number
  itemsBreakdown: TaxQuoteItemBreakdown[]
  shippingBreakdown: TaxQuoteShippingBreakdown
}

export interface GSTState {
  code: string
  name: string
}

export const INDIAN_GST_STATES: GSTState[] = [
  { code: "01", name: "Jammu and Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "26", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "27", name: "Maharashtra" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman and Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
  { code: "38", name: "Ladakh" },
]
