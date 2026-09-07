/**
 * @file marketing.ts
 * @description Mock data and constants for Promotions and Coupon codes.
 */

import { PromotionRuleData } from "@/components/modules/marketing/promotion-rule-card"

export const MARKETING_PROMOTIONS: PromotionRuleData[] = [
  {
    id: "prm_9011",
    name: "Cyber Tech Week: Tiered Cart Savings",
    codeRef: "PRM-TIER-CYBER",
    type: "tiered_cart",
    typeLabel: "Tiered Cart Value",
    priority: 100,
    status: "active",
    startDate: "2024-10-25",
    endDate: "2024-11-05",
    channels: ["web", "mobile"],
    stacking: "compound",
    triggerSummary: "Cart subtotal ≥ $150 / $300 / $500",
    actionSummary: "Tiered cash discounts: -$15 / -$40 / -$80",
    attributedGmv: 184200,
    redemptions: 1420,
    marginDelta: -2.8,
    featured: true,
  },
  {
    id: "prm_8820",
    name: "Apex Pro Keyboard & Aviator Cable Bundle",
    codeRef: "PRM-BNDL-KEYCBL",
    type: "bundle_bogo",
    typeLabel: "Bundle Pairing (BOGO)",
    priority: 90,
    status: "active",
    startDate: "2024-09-01",
    endDate: "2024-12-31",
    channels: ["web"],
    stacking: "compound",
    triggerSummary: "Buy APX-KB-BLK-TAC Keyboard",
    actionSummary: "Get CBL-AVT-CHR Cable at 40% Off ($27.00)",
    attributedGmv: 78400,
    redemptions: 620,
    marginDelta: -1.4,
    featured: true,
  },
  {
    id: "prm_9340",
    name: "Midnight Flash Drop: Moondrop Audio Series",
    codeRef: "PRM-FLSH-MOON",
    type: "flash_sale",
    typeLabel: "Timed Catalog Markdown",
    priority: 120,
    status: "active",
    startDate: "2024-10-31",
    endDate: "2024-11-01",
    channels: ["web", "mobile"],
    stacking: "priority_override",
    triggerSummary: "Category 'Audiophile IEMs & DACs'",
    actionSummary: "Automatic 25% Instant Markdown at Checkout",
    attributedGmv: 42150,
    redemptions: 310,
    marginDelta: -4.2,
    featured: true,
  },
  {
    id: "prm_7015",
    name: "VIP Prime Free Next-Day Courier Delivery",
    codeRef: "PRM-SHP-VIP01",
    type: "free_shipping",
    typeLabel: "Shipping Surcharge Waiver",
    priority: 50,
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    channels: ["web", "mobile", "pos"],
    stacking: "compound",
    triggerSummary: "User tier = VIP Gold & Subtotal ≥ $75",
    actionSummary: "Waive FedEx Priority Overnight Fee ($18.00)",
    attributedGmv: 312000,
    redemptions: 4890,
    marginDelta: -0.8,
  },
]

export interface CouponData {
  id: string
  code: string
  discount: string
  discountType: "percentage" | "fixed" | "free_shipping"
  status: "active" | "scheduled" | "expired" | "exhausted"
  usageCount: number
  usageLimit: number
  minOrderValue: number
  startDate: string
  endDate: string
  attributedRevenue: number
}

export const MARKETING_COUPONS: CouponData[] = [
  {
    id: "cpn_1001",
    code: "WELCOME10",
    discount: "10% OFF",
    discountType: "percentage",
    status: "active",
    usageCount: 3420,
    usageLimit: 10000,
    minOrderValue: 50,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    attributedRevenue: 171000,
  },
  {
    id: "cpn_1002",
    code: "VIPSECRET25",
    discount: "$25 OFF",
    discountType: "fixed",
    status: "active",
    usageCount: 840,
    usageLimit: 1000,
    minOrderValue: 150,
    startDate: "2024-10-01",
    endDate: "2024-11-30",
    attributedRevenue: 126000,
  },
  {
    id: "cpn_1003",
    code: "FREESHIPNOW",
    discount: "FREE SHIPPING",
    discountType: "free_shipping",
    status: "active",
    usageCount: 5120,
    usageLimit: 20000,
    minOrderValue: 75,
    startDate: "2024-06-01",
    endDate: "2024-12-31",
    attributedRevenue: 384000,
  },
  {
    id: "cpn_1004",
    code: "SUMMEREND",
    discount: "20% OFF",
    discountType: "percentage",
    status: "expired",
    usageCount: 1200,
    usageLimit: 1200,
    minOrderValue: 100,
    startDate: "2024-08-01",
    endDate: "2024-09-01",
    attributedRevenue: 120000,
  },
]
